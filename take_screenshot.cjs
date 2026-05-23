const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        await page.goto('http://localhost:5173');

        // Wait for 3D globe to render
        await new Promise(r => setTimeout(r, 4000));

        // Desktop
        await page.setViewport({ width: 1440, height: 900 });
        await page.screenshot({ path: '/Users/cibhiadhinath/.gemini/antigravity/brain/66031a35-4c7b-45dc-bba4-82b134d94507/cinematic_desktop_new.png', fullPage: true });

        // Mobile
        await page.setViewport({ width: 390, height: 844, isMobile: true });
        await page.screenshot({ path: '/Users/cibhiadhinath/.gemini/antigravity/brain/66031a35-4c7b-45dc-bba4-82b134d94507/cinematic_mobile_new.png', fullPage: true });

        await browser.close();
        console.log("Screenshots captured successfully");
    } catch (err) {
        console.error(err);
    }
})();
