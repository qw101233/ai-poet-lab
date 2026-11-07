// AI Poet Lab · 诗歌引擎格律自检脚本
// 用法：node scripts/verify-engine.mjs
// 验证 README 声明的指标：唐诗/宋词格律 120/120、句内无重复意象、生成多样性
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const code = readFileSync(join(root, 'js', 'poem-engine.js'), 'utf8');
// poem-engine.js 为浏览器 classic script（const PoemEngine = {...}），用 Function 包装取出
const PoemEngine = new Function(`${code}; return PoemEngine;`)();

const emotions = PoemEngine.getEmotions();
const failures = [];
let pass = 0, total = 0;

function check(name, fn) {
    total++;
    try {
        if (fn()) pass++;
        else failures.push(name);
    } catch (e) {
        failures.push(`${name}（异常: ${e.message}）`);
    }
}

// ---- 1. 唐诗格律：8 情感 × 15 次 = 120 首 ----
let tangOk = 0;
const TANG_N = 120;
for (let i = 0; i < TANG_N; i++) {
    const emo = emotions[i % emotions.length];
    const p = PoemEngine.generate('月', emo, 'tangshi');
    if (PoemEngine.validate(p).ok) tangOk++;
    else failures.push(`唐诗格律 #${i} [${emo}/${p.style}] ${PoemEngine.validate(p).actual}`);
}
check(`唐诗格律 ${tangOk}/${TANG_N}`, () => tangOk === TANG_N);

// ---- 2. 宋词格律：8 情感 × 15 次 = 120 首（收缩词牌表强制覆盖每种）----
const patterns = PoemEngine.getCiPatterns();
const allPatterns = { ...PoemEngine.songciPatterns };
let ciOk = 0;
const CI_N = 120;
const usedPatterns = new Set();
for (let i = 0; i < CI_N; i++) {
    const emo = emotions[i % emotions.length];
    const pat = patterns[i % patterns.length];
    // 引擎随机选词牌，这里临时只保留目标词牌以确定性覆盖
    PoemEngine.songciPatterns = { [pat]: allPatterns[pat] };
    const p = PoemEngine.generate('月', emo, 'songci');
    usedPatterns.add(p.style);
    if (PoemEngine.validate(p).ok) ciOk++;
    else failures.push(`宋词格律 #${i} [${emo}/${p.style}] ${PoemEngine.validate(p).actual}`);
}
PoemEngine.songciPatterns = allPatterns;
check(`宋词格律 ${ciOk}/${CI_N}（词牌覆盖 ${usedPatterns.size}/${patterns.length}）`, () => ciOk === CI_N && usedPatterns.size === patterns.length);

// ---- 3. 句内重复意象：统计 2 字片段是否在句内重复出现 ----
let linesChecked = 0, dupLines = 0;
for (let i = 0; i < 160; i++) {
    const emo = emotions[i % emotions.length];
    const p = PoemEngine.generate('月', emo, i % 2 ? 'tangshi' : 'songci');
    for (const line of p.lines) {
        linesChecked++;
        const seen2 = new Set();
        for (let j = 0; j + 2 <= line.length; j++) {
            const g = line.slice(j, j + 2);
            if (seen2.has(g)) { dupLines++; break; }
            seen2.add(g);
        }
    }
}
check(`句内重复意象 ${dupLines}/${linesChecked} 句`, () => dupLines === 0);

// ---- 4. 生成多样性：100 首唐诗内容全部唯一 ----
const uniq = new Set();
for (let i = 0; i < 100; i++) {
    uniq.add(PoemEngine.generate('月', emotions[i % emotions.length], 'tangshi').lines.join('\n'));
}
check(`多样性 ${uniq.size}/100 首唯一`, () => uniq.size === 100);

// ---- 5. 现代诗可用性 ----
check('现代诗生成（8 情感）', () => {
    return emotions.every(emo => {
        const p = PoemEngine.generate('月', emo, 'modern');
        return p.lines.length >= 4 && p.lines.every(l => l.length > 0);
    });
});

// ---- 汇总 ----
console.log(`\n结果: ${pass}/${total} 通过`);
if (failures.length) {
    console.log('失败项:');
    for (const f of [...new Set(failures)].slice(0, 10)) console.log('  - ' + f);
    process.exit(1);
}
console.log('✓ 全部通过');
