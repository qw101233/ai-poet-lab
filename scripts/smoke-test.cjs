// AI Poet Lab · 浏览器冒烟测试（一次性）
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    await page.goto('file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(1500);

    // 点击「开始创作」生成一首诗
    await page.getByText('开始创作').click();
    await page.waitForTimeout(2500);

    const result = await page.evaluate(() => {
        const lines = [...document.querySelectorAll('.poem-line, .poem-text, .line')].map(e => e.textContent.trim()).filter(Boolean);
        // classic script 顶层 const 不挂 window，直接在页面全局作用域探测
        let hasValidate = false;
        try { hasValidate = typeof PoemEngine.validate === 'function'; } catch { /* 未定义 */ }
        return { poemLines: lines, hasValidate };
    });

    await page.screenshot({ path: path.join(__dirname, 'smoke.png') });
    await browser.close();

    if (errors.length) { console.error('FAIL 页面报错:\n' + errors.join('\n')); process.exit(1); }
    if (!result.hasValidate) { console.error('FAIL PoemEngine.validate 不可用'); process.exit(1); }
    console.log('页面无报错；PoemEngine.validate 可用；生成行数: ' + result.poemLines.length);
    console.log('OK');
})();
