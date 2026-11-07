/**
 * AI Poet Lab · 介绍图文生成脚本
 * 合成 9:16 竖屏（1080x1920）介绍图文，包含三个画面：
 *   1. 项目简介
 *   2. 核心功能演示
 *   3. 最终效果展示
 *
 * 运行：node scripts/make-intro.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');
const OUT = path.join(ASSETS, 'intro-9x16.png');

// 9:16 竖屏尺寸（抖音标准）
const W = 1080;
const H = 1920;

// 主色调（与站点一致）
const C = {
    inkDeep: '#16213e',
    inkBlack: '#0d1526',
    gold: '#d4a574',
    goldBright: '#e8c9a0',
    paper: '#f5f0e6',
    redSeal: '#c0392b'
};

/** 生成纯色 SVG 卡片（用于分屏背景与字幕条） */
function cardSVG(w, h, body) {
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${C.inkDeep}"/>
                <stop offset="100%" stop-color="${C.inkBlack}"/>
            </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#bg)"/>
        ${body}
        </svg>`
    );
}

/** 顶部标题条 SVG */
function headerSVG(text, sub, w = W, h = 190) {
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
            <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="${C.gold}" stop-opacity="0"/>
                <stop offset="20%" stop-color="${C.gold}" stop-opacity="0.35"/>
                <stop offset="80%" stop-color="${C.gold}" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="${C.gold}" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <rect x="0" y="${h - 3}" width="${w}" height="3" fill="url(#hl)"/>
        <circle cx="58" cy="72" r="34" fill="${C.gold}"/>
        <text x="58" y="88" font-size="38" font-family="Microsoft YaHei, sans-serif" font-weight="bold"
              text-anchor="middle" fill="${C.inkDeep}">${text}</text>
        <text x="112" y="80" font-size="42" font-family="Microsoft YaHei, sans-serif" font-weight="bold"
              fill="${C.goldBright}">${sub}</text>
        </svg>`
    );
}

/** 底部字幕条 SVG（保证字幕清晰可读） */
function captionSVG(lines, w = W, h = 300) {
    const rowH = 62;
    const startY = h - 40 - (lines.length - 1) * rowH;
    const body = lines.map((ln, i) => {
        const y = startY + i * rowH;
        const size = i === 0 ? 40 : 32;
        const color = i === 0 ? C.goldBright : '#d8d2c4';
        const weight = i === 0 ? 'bold' : 'normal';
        return `<text x="${w / 2}" y="${y}" font-size="${size}" font-family="Microsoft YaHei, sans-serif"
                 font-weight="${weight}" text-anchor="middle" fill="${color}">${ln}</text>`;
    }).join('\n');

    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
            <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${C.inkBlack}" stop-opacity="0"/>
                <stop offset="35%" stop-color="${C.inkBlack}" stop-opacity="0.88"/>
                <stop offset="100%" stop-color="${C.inkBlack}" stop-opacity="0.97"/>
            </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#cap)"/>
        ${body}
        </svg>`
    );
}

/** 把截图按 contain 方式缩放并填充到指定尺寸（完整显示，不裁剪内容） */
async function cover(file, w, h) {
    const buf = await sharp(file).png().toBuffer();
    const img = sharp(buf);
    const meta = await img.metadata();

    // 等比缩放铺满（保持完整画面，允许少量留白）
    const scale = Math.min(w / meta.width, h / meta.height);
    const rw = Math.round(meta.width * scale);
    const rh = Math.round(meta.height * scale);

    const resized = await sharp(buf)
        .resize(rw, rh, { fit: 'fill' })
        .png().toBuffer();

    return sharp({
        create: { width: w, height: h, channels: 4, background: { r: 13, g: 21, b: 38, alpha: 1 } }
    })
        .composite([{ input: resized, top: Math.round((h - rh) / 2), left: Math.round((w - rw) / 2) }])
        .png().toBuffer();
}

/** 圆角+描边边框 */
async function frame(buf, w, h, radius = 18, borderColor = C.gold) {
    const meta = await sharp(buf).metadata();

    // 内容按 contain 方式内缩到边框内
    const inner = await sharp(buf)
        .resize(w - 8, h - 8, { fit: 'inside' })
        .png().toBuffer();

    const innerMeta = await sharp(inner).metadata();
    const canvas = sharp({
        create: { width: w, height: h, channels: 4, background: { r: 13, g: 21, b: 38, alpha: 1 } }
    });

    return canvas
        .composite([
            {
                input: inner,
                top: Math.round((h - innerMeta.height) / 2),
                left: Math.round((w - innerMeta.width) / 2)
            },
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
                    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${radius}" ry="${radius}"
                          fill="none" stroke="${borderColor}" stroke-width="3" stroke-opacity="0.75"/>
                    </svg>`
                ),
                top: 0, left: 0
            }
        ]).png().toBuffer();
}

/** 主流程 */
async function main() {
    if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS, { recursive: true });

    const shots = {
        intro: path.join(ASSETS, 'shot-intro.png'),
        create: path.join(ASSETS, 'shot-create.png'),
        collection: path.join(ASSETS, 'shot-collection.png')
    };

    for (const [k, p] of Object.entries(shots)) {
        if (!fs.existsSync(p)) {
            console.error(`缺少素材截图: ${p}`);
            process.exit(1);
        }
    }

    // 三个画面的内容区高度
    const PANEL_H = 1150;   // 中部截图区
    const HEAD_H = 190;     // 顶部标题
    const CAP_H = 300;      // 底部字幕
    const CAP_TOP = H - CAP_H;   // 字幕条起始 y

    // ---------- 画面 1：项目简介 ----------
    const p1shot = await frame(await cover(shots.intro, W - 60, 900), W - 60, 900);
    const p1 = await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 22, g: 33, b: 62, alpha: 1 } }
    })
        .composite([
            { input: cardSVG(W, H, ''), top: 0, left: 0 },
            { input: headerSVG('01', 'AI Poet Lab · 项目简介'), top: 0, left: 0 },
            { input: p1shot, top: 230, left: 30 },
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="470">
                    <text x="${W / 2}" y="70" font-size="72" font-family="STKaiti, KaiTi, serif" font-weight="bold"
                          text-anchor="middle" fill="${C.goldBright}">AI 智能诗歌实验室</text>
                    <text x="${W / 2}" y="145" font-size="34" font-family="Microsoft YaHei, sans-serif"
                          text-anchor="middle" fill="#e8e0d0">墨韵 · 韵律 · 意境</text>
                    <rect x="${W / 2 - 150}" y="185" width="300" height="2" fill="${C.gold}" opacity="0.6"/>
                    <text x="${W / 2}" y="255" font-size="32" font-family="Microsoft YaHei, sans-serif"
                          text-anchor="middle" fill="#cfc8ba">输入主题与情感，实时生成</text>
                    <text x="${W / 2}" y="315" font-size="32" font-family="Microsoft YaHei, sans-serif"
                          text-anchor="middle" fill="#cfc8ba">唐诗 · 宋词 · 现代诗</text>
                    <text x="${W / 2}" y="420" font-size="30" font-family="Microsoft YaHei, sans-serif"
                          text-anchor="middle" fill="${C.gold}" opacity="0.95">✦ 零依赖纯前端  ✦ 离线可用</text>
                    <text x="${W / 2}" y="460" font-size="30" font-family="Microsoft YaHei, sans-serif"
                          text-anchor="middle" fill="${C.gold}" opacity="0.95">✦ 意象组合算法  ✦ 意境配图</text>
                    </svg>`
                ),
                top: 1150, left: 0
            },
            { input: captionSVG(['项目简介', '一个开箱即用的浏览器端 AI 诗歌创作实验室']), top: CAP_TOP, left: 0 }
        ])
        .png().toBuffer();

    // ---------- 画面 2：核心功能演示 ----------
    const p2shot = await frame(await cover(shots.create, W - 60, PANEL_H), W - 60, PANEL_H);
    const p2 = await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 22, g: 33, b: 62, alpha: 1 } }
    })
        .composite([
            { input: cardSVG(W, H, ''), top: 0, left: 0 },
            { input: headerSVG('02', '核心功能演示'), top: 0, left: 0 },
            { input: p2shot, top: 230, left: 30 },
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="230">
                    <g font-family="Microsoft YaHei, sans-serif" font-size="30" text-anchor="middle">
                        <rect x="50" y="20" width="300" height="66" rx="33" fill="${C.gold}" opacity="0.16"/>
                        <text x="200" y="63" fill="${C.goldBright}">8 种情感基调</text>
                        <rect x="390" y="20" width="300" height="66" rx="33" fill="${C.gold}" opacity="0.16"/>
                        <text x="540" y="63" fill="${C.goldBright}">4 种词牌</text>
                        <rect x="730" y="20" width="300" height="66" rx="33" fill="${C.gold}" opacity="0.16"/>
                        <text x="880" y="63" fill="${C.goldBright}">3 种诗体</text>
                        <rect x="50" y="120" width="300" height="66" rx="33" fill="${C.redSeal}" opacity="0.22"/>
                        <text x="200" y="163" fill="#f0b8b0">语音朗读</text>
                        <rect x="390" y="120" width="300" height="66" rx="33" fill="${C.redSeal}" opacity="0.22"/>
                        <text x="540" y="163" fill="#f0b8b0">意境配图</text>
                        <rect x="730" y="120" width="300" height="66" rx="33" fill="${C.redSeal}" opacity="0.22"/>
                        <text x="880" y="163" fill="#f0b8b0">收藏管理</text>
                    </g>
                    </svg>`
                ),
                top: 1380, left: 0
            },
            { input: captionSVG(['核心功能演示', '选择主题与情感 · 一键生成 · 朗读配图收藏']), top: CAP_TOP, left: 0 }
        ])
        .png().toBuffer();

    // ---------- 画面 3：最终效果展示 ----------
    const p3shot = await frame(await cover(shots.collection, W - 60, 900), W - 60, 900);
    const p3 = await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 22, g: 33, b: 62, alpha: 1 } }
    })
        .composite([
            { input: cardSVG(W, H, ''), top: 0, left: 0 },
            { input: headerSVG('03', '最终效果展示'), top: 0, left: 0 },
            { input: p3shot, top: 230, left: 30 },
            {
                input: Buffer.from(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="420">
                    <rect x="${W / 2 - 320}" y="20" width="640" height="360" rx="16" fill="#0f1a30" opacity="0.88"
                          stroke="${C.gold}" stroke-width="2" stroke-opacity="0.55"/>
                    <text x="${W / 2}" y="95" font-size="42" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.goldBright}">月 光 · 望</text>
                    <text x="${W / 2}" y="175" font-size="32" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.paper}">思归晚钟旧忆怅望</text>
                    <text x="${W / 2}" y="240" font-size="32" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.paper}">归舟堪怜家书空忆</text>
                    <text x="${W / 2}" y="305" font-size="32" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.paper}">游子望断秋风独怜</text>
                    <text x="${W / 2}" y="370" font-size="32" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.paper}">霜月独倚乡心梦绕</text>
                    <rect x="${W / 2 + 235}" y="310" width="52" height="52" rx="7" fill="${C.redSeal}"/>
                    <text x="${W / 2 + 261}" y="347" font-size="30" font-family="STKaiti, KaiTi, serif"
                          text-anchor="middle" fill="${C.paper}">诗</text>
                    </svg>`
                ),
                top: 1180, left: 0
            },
            { input: captionSVG(['最终效果展示', '独特诗篇 + 水墨意境 · 值得收藏的创作']), top: CAP_TOP, left: 0 }
        ])
        .png().toBuffer();

    // ---------- 纵向拼接三画面 ----------
    const separator = await sharp({
        create: { width: W, height: 24, channels: 4, background: { r: 22, g: 33, b: 62, alpha: 1 } }
    })
        .composite([{
            input: Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="24">
                <rect x="0" y="11" width="${W}" height="2" fill="${C.gold}" opacity="0.4"/>
                </svg>`
            ), top: 0, left: 0
        }]).png().toBuffer();

    const final = await sharp({
        create: { width: W, height: H * 3 + 48, channels: 4, background: { r: 22, g: 33, b: 62, alpha: 1 } }
    })
        .composite([
            { input: p1, top: 0, left: 0 },
            { input: separator, top: H, left: 0 },
            { input: p2, top: H + 24, left: 0 },
            { input: separator, top: H * 2 + 24, left: 0 },
            { input: p3, top: H * 2 + 48, left: 0 }
        ])
        .png().toBuffer();

    await sharp(final).toFile(OUT);

    // 同时输出单画面版本，便于各处使用
    await sharp(p1).toFile(path.join(ASSETS, 'intro-1-project.png'));
    await sharp(p2).toFile(path.join(ASSETS, 'intro-2-features.png'));
    await sharp(p3).toFile(path.join(ASSETS, 'intro-3-result.png'));

    const meta = await sharp(OUT).metadata();
    console.log(`✓ 生成完成: ${OUT}`);
    console.log(`  尺寸: ${meta.width} x ${meta.height} (单画面 9:16)`);
    console.log(`  总高度: ${meta.height} (三画面纵向拼接)`);
    console.log(`  拆分图: intro-1-project.png / intro-2-features.png / intro-3-result.png`);
}

main().catch(err => {
    console.error('生成失败:', err);
    process.exit(1);
});
