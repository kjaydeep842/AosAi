import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  const result = await page.evaluate(() => {
    const a = document.createElement('a');
    return 'download' in a;
  });
  console.log("Supports download attribute:", result);
  
  await browser.close();
})();
