import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  
  await page.type('input[name="username"]', 'admin');
  await page.type('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT HTML LENGTH AFTER LOGIN:", rootHtml.length);
  const title = await page.$eval('h2', el => el.textContent).catch(() => 'No H2');
  console.log("H2 ON PAGE:", title);
  
  await browser.close();
})();
