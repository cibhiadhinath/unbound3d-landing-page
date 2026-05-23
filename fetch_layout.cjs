const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:5173');

    // Wait a moment for things to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    const layout = await page.evaluate(() => {
        const capNodes = Array.from(document.querySelectorAll('.cap-node')).map(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return {
                text: el.innerText.replace(/\n/g, ' '),
                top: el.style.top,
                left: el.style.left,
                right: el.style.right,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                visibility: style.visibility,
                opacity: style.opacity
            };
        });

        const starLabels = Array.from(document.querySelectorAll(".star-label")).map(el => { const rect = el.getBoundingClientRect(); const style = window.getComputedStyle(el); return { text: el.innerText, transform: el.style.transform, opacity: style.opacity, visibility: style.visibility }; }); const capDots = Array.from(document.querySelectorAll('.cap-dot')).map(el => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return {
                transform: el.style.transform,
                opacity: style.opacity,
                visibility: style.visibility,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            };
        });

        return { capNodes, capDots, window: { width: window.innerWidth, height: window.innerHeight } };
    });

    console.log(JSON.stringify(layout, null, 2));

    await browser.close();
})();
