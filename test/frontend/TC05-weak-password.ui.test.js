/**
 * TC05 - Mật khẩu yếu
 * Test nhập mật khẩu ngắn hơn 6 ký tự
 */

const puppeteer = require("puppeteer");

jest.setTimeout(30000);

describe("TC05 - Mật khẩu yếu", () => {
  let browser;
  let page;

  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const registerUrl = `${base.replace(/\/$/, "")}/auth/register`;

  const validUser = {
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone_number: "0901234567",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const waitForHydration = async () => {
    await page.waitForSelector("form", { timeout: 15000 });
    try {
      await page.waitForFunction(
        () =>
          document &&
          document.body &&
          document.body.dataset &&
          document.body.dataset.hydrated === "true",
        { timeout: 8000 }
      );
    } catch (e) {
      await sleep(2000);
    }
  };

  const submitForm = async () => {
    await page.waitForSelector("button[type='submit']:not([disabled])", {
      visible: true,
      timeout: 10000,
    });

    await sleep(500);

    // Method 1: Press Enter (most reliable for React Hook Form)
    try {
      await page.focus("#address");
      await page.keyboard.press("Enter");
      await sleep(1000);
      return;
    } catch (e) {
      console.log("Enter key method failed, trying click...");
    }

    // Method 2: Fallback to click
    try {
      await page.click("button[type='submit']");
    } catch (e) {
      console.log("Click method failed");
    }

    await sleep(1000);
  };

  const getErrorText = async (selector) => {
    try {
      await page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel);
          const errorP = el?.closest("div")?.querySelector("p");
          return errorP && errorP.textContent.trim().length > 0;
        },
        { timeout: 5000 },
        selector
      );
    } catch (e) {}

    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const errorParagraph = el?.closest("div")?.querySelector("p");
      return errorParagraph ? errorParagraph.textContent.trim() : "";
    }, selector);
  };

  const fillForm = async (userData) => {
    if (userData.full_name !== undefined && userData.full_name !== "") {
      await page.type("#full_name", userData.full_name);
    }
    if (userData.email !== undefined && userData.email !== "") {
      await page.type("#email", userData.email);
    }
    if (userData.phone_number !== undefined && userData.phone_number !== "") {
      await page.type("#phone_number", userData.phone_number);
    }
    if (userData.password !== undefined && userData.password !== "") {
      await page.type("#password", userData.password);
    }
    if (
      userData.confirm_password !== undefined &&
      userData.confirm_password !== ""
    ) {
      await page.type("#confirm_password", userData.confirm_password);
    }
    if (userData.address !== undefined && userData.address !== "") {
      await page.type("#address", userData.address);
    }
  };

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: { width: 1280, height: 800 },
    });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
    });
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
  });

  afterEach(async () => {
    try {
      if (page && !page.isClosed()) {
        await page.setRequestInterception(false);
        await page.close();
      }
    } catch (e) {}
  });

  test("Nhập mật khẩu ngắn hơn 6 ký tự", async () => {
    await page.waitForSelector("#password", { timeout: 10000 });

    await fillForm({
      full_name: validUser.full_name,
      email: validUser.email,
      phone_number: validUser.phone_number,
      password: "123", // Mật khẩu quá ngắn
      confirm_password: "123",
      address: validUser.address,
    });

    await submitForm();
    await sleep(1000);

    const errorText = await getErrorText("#password");
    expect(errorText).toMatch(/Mật khẩu phải có ít nhất 6 ký tự|Mật khẩu yếu/);
  });
});
