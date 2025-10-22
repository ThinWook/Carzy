const puppeteer = require("puppeteer");

async function launchBrowser() {
  const headless = process.env.PUPPETEER_HEADLESS === "false" ? false : "new";
  const browser = await puppeteer.launch({
    headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    defaultViewport: { width: 1280, height: 800 },
  });
  return browser;
}

module.exports = { launchBrowser };
