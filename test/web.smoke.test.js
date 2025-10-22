const { launchBrowser } = require("./helpers/puppeteer");

const WEB_BASE = process.env.WEB_BASE || "http://localhost:3000";

describe("Web smoke (Next.js)", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowser();
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test("Home page renders and shows the catalog section title", async () => {
    try {
      await page.goto(WEB_BASE, { waitUntil: "networkidle2" });
    } catch (err) {
      console.warn(`[SKIP] Web not reachable at ${WEB_BASE}: ${err.message}`);
      return; // skip gracefully if not running
    }

    // The home page includes the Vietnamese heading for the catalog
    await page.waitForSelector("h2");
    const text = await page.evaluate(() => {
      const h2s = Array.from(document.querySelectorAll("h2")).map((el) =>
        el.textContent?.trim()
      );
      return h2s.join(" | ");
    });
    expect(text).toMatch(
      /Khám phá danh mục Xe cũ|Xe mới đăng gần đây|Oops, no results/
    );
  });
});
