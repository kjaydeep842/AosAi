import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    // mock a user and payment to show billing tab
    localStorage.setItem('aos_logged_in_user', 'admin');
    localStorage.setItem('aos_local_db', JSON.stringify({
      users: [{ username: 'admin', password: '123' }],
      payments: { 'admin': [{ date: '28/05', id: 'pay_123', planName: 'Dev', amount: 10, status: 'Success' }] }
    }));
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  // Click on "Billing & Invoices" tab
  // find sidebar link with text "Billing & Invoices"
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.sidebar-link'));
    const billingLink = links.find(l => l.textContent.includes('Billing & Invoices'));
    if (billingLink) billingLink.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click "Download"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Download'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
