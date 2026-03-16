/**
 * TC04 - Sai định dạng email
 * Test nhập email không đúng định dạng
 */

const puppeteer = require("puppeteer");

jest.setTimeout(30000);

describe("TC04 - Sai định dạng email", () => {
  let browser;
  let page;

  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const registerUrl = `${base.replace(/\/$/, "")}/auth/register`;

  const validUser = {
    full_name: "Nguyễn Văn A",
    phone_number: "0901234567",
    password: "Password123",
    confirm_password: "Password123",
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

  test("Nhập email không đúng định dạng", async () => {
    await page.waitForSelector("#email", { timeout: 10000 });

    await fillForm({
      full_name: validUser.full_name,
      email: "testinvalid.com", // Email không hợp lệ (không có @)
      phone_number: validUser.phone_number,
      password: validUser.password,
      confirm_password: validUser.confirm_password,
      address: validUser.address,
    });

    // Đợi một chút để form update
    await sleep(500);

    // Click button để trigger validation
    await page.waitForSelector("button[type='submit']:not([disabled])", {
      visible: true,
      timeout: 10000,
    });

    // Try to click multiple times to ensure validation triggers
    await page.evaluate(() => {
      const btn = document.querySelector("button[type='submit']");
      if (btn) btn.click();
    });
    await sleep(1000);

    // Try clicking again if needed
    await page.click("button[type='submit']").catch(() => {});
    await sleep(2000);

    // Check for React Hook Form error OR HTML5 validation message
    const errorText = await getErrorText("#email");

    if (!errorText) {
      // Nếu không có React Hook Form error, kiểm tra HTML5 validation
      const html5ValidationMessage = await page.evaluate(() => {
        const emailInput = document.querySelector("#email");
        return emailInput?.validationMessage || "";
      });

      console.log("HTML5 validation message:", html5ValidationMessage);

      // Chấp nhận cả HTML5 validation message (có chứa @ hoặc email)
      expect(html5ValidationMessage).toMatch(/@|email/i);
    } else {
      // Có React Hook Form error
      expect(errorText).toMatch(/Email không hợp lệ|Sai định dạng email/);
    }
  });
});
