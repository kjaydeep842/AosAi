import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => {
    console.log("DIALOG MESSAGE:", dialog.message());
    await dialog.dismiss();
  });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  await page.type('input[name="username"]', 'admin');
  await page.type('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT HTML LENGTH AFTER LOGIN:", rootHtml.length);
  
  await browser.close();
})();
