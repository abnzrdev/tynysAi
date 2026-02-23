const fs = require('fs');
const puppeteer = require('puppeteer');

async function run() {
  const out = [];
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Runtime.enable');
  await client.send('Console.enable');
  client.on('Runtime.exceptionThrown', (e) => {
    try {
      const ex = e.exceptionDetails || e;
      const text = `[cdp:exception] ${ex.text || JSON.stringify(ex)}`;
      out.push(text);
      console.error(text);
    } catch (err) { }
  });

  page.on('console', msg => {
    (async () => {
      let text = `[console:${msg.type()}] ${msg.text()}`;
      try {
        const args = msg.args();
        for (const a of args) {
          try {
            const maybe = await a.jsonValue();
            if (maybe && maybe.stack) text += `\nSTACK: ${maybe.stack}`;
          } catch (e) {
            // ignore
          }
        }
      } catch (e) { }
      out.push(text);
      console.log(text);
    })();
  });

  page.on('pageerror', err => {
    const text = `[pageerror] ${err.stack || err.message}`;
    out.push(text);
    console.error(text);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      const text = `[response:${res.status()}] ${res.url()}`;
      out.push(text);
      console.warn(text);
    }
  });

  const target = process.argv[2] || 'https://tynysai.kz/en/sign-in';
  console.log('Visiting', target);
  await page.goto(target, { waitUntil: 'networkidle2', timeout: 30000 }).catch(err => console.error('goto error', err.message));

  // interact a bit: focus and click sign-in button if present
  try {
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"], button');
      if (btn) btn.scrollIntoView();
    });
    // try filling a test credential and submit
    try {
      await page.type('input[type="email"]', 'test@example.com', { delay: 50 });
      await page.type('input[type="password"]', 'password', { delay: 50 });
      const submit = await page.$('button[type="submit"]');
      if (submit) await submit.click();
    } catch (e) {
      // ignore if form fields not found
    }
  } catch (e) { }

  // wait to collect async console messages
  await new Promise((r) => setTimeout(r, 8000));

  const outPath = '/tmp/console-capture.txt';
  fs.writeFileSync(outPath, out.join('\n'));
  console.log('Wrote console capture to', outPath);

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
