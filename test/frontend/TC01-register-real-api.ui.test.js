/**
 * TC01 - Tạo tài khoản thành công (Real API Test)
 * Test đăng ký với đầy đủ thông tin hợp lệ - GỌI API THẬT
 */

const puppeteer = require("puppeteer");

jest.setTimeout(60000);

describe("TC01 - Tạo tài khoản thành công (Real API)", () => {
  let browser;
  let page;

  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const registerUrl = `${base.replace(/\/$/, "")}/auth/register`;

  // Use a unique email for each test run
  const timestamp = Date.now();
  const validUser = {
    full_name: "Test User " + timestamp,
    email: `testuser${timestamp}@example.com`,
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
    // Wait for submit button to be visible and enabled
    await page.waitForSelector("button[type='submit']:not([disabled])", {
      visible: true,
      timeout: 10000,
    });

    await sleep(500);

    // Method 1: Try pressing Enter in the last field (most reliable for forms)
    try {
      await page.focus("#address");
      await page.keyboard.press("Enter");
      console.log("✓ Pressed Enter to submit form");
      await sleep(1500);
      return;
    } catch (e) {
      console.log("Method 1 (Enter key) failed, trying mouse click...");
    }

    // Method 2: Use mouse click
    try {
      // Scroll button into view
      await page.evaluate(() => {
        const btn = document.querySelector("button[type='submit']");
        if (btn) {
          btn.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      await sleep(300);

      const buttonElement = await page.$("button[type='submit']");
      if (buttonElement) {
        const box = await buttonElement.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          console.log("✓ Clicked submit button with mouse");
        }
      }
    } catch (e) {
      console.log("Method 2 (mouse click) failed");
    }

    await sleep(1000);
  };

  const waitForToast = async (pattern, timeout = 10000) => {
    try {
      await page.waitForFunction(
        (regex) => {
          const container = document.querySelector(
            '[class*="react-hot-toast"]'
          );
          if (!container) return false;
          const text = container.innerText || "";
          return new RegExp(regex).test(text);
        },
        { timeout },
        pattern
      );
      return true;
    } catch (e) {
      try {
        await page.waitForFunction(
          (regex) => {
            const text = document.body?.innerText || "";
            return new RegExp(regex).test(text);
          },
          { timeout: 5000 },
          pattern
        );
        return true;
      } catch (e2) {
        return false;
      }
    }
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
      slowMo: 50, // Slow down by 50ms per action for easier viewing
    });
  });

  afterAll(async () => {
    if (browser) {
      await sleep(2000); // Give time to see result
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
    });

    // Log console messages from the page
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        console.log(`Browser ${type}:`, msg.text());
      }
    });

    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
  });

  afterEach(async () => {
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
    } catch (e) {}
  });

  test("Đăng ký với đầy đủ thông tin hợp lệ và chuyển tới trang đăng nhập (REAL API)", async () => {
    console.log("=".repeat(60));
    console.log("Testing with REAL API - Backend must be running!");
    console.log("User email:", validUser.email);
    console.log("=".repeat(60));

    console.log("\nStep 1: Waiting for form to be ready...");
    await page.waitForSelector("#full_name", { timeout: 10000 });

    console.log("Step 2: Filling form with data...");
    await fillForm(validUser);
    await sleep(500);

    console.log("Step 3: Taking screenshot before submit...");
    await page.screenshot({ path: "tc01-before-submit.png" });

    console.log("Step 4: Submitting form...");

    // Monitor network activity
    const requests = [];
    page.on("request", (req) => {
      if (req.method() === "POST") {
        requests.push(req.url());
        console.log("  → POST request:", req.url());
      }
    });

    await submitForm();

    console.log("Step 5: Waiting for response (max 15s)...");

    // Wait and check for button state changes
    await sleep(2000);
    const isButtonDisabled = await page.$eval(
      'button[type="submit"]',
      (btn) => btn.disabled
    );
    console.log("  Button disabled after click:", isButtonDisabled);

    const buttonText = await page.$eval(
      'button[type="submit"]',
      (btn) => btn.textContent
    );
    console.log("  Button text:", buttonText);

    await sleep(3000);

    console.log("  Total POST requests made:", requests.length);

    // Take screenshot after submit
    await page.screenshot({ path: "tc01-after-submit.png" });

    console.log("Step 6: Checking result...");
    const finalUrl = page.url();
    console.log("Current URL:", finalUrl);

    // Check for success indicators
    const hasSuccessToast = await waitForToast(
      "Đăng ký thành công|Tạo tài khoản thành công",
      5000
    );
    const isOnLoginPage = finalUrl.includes("/auth/login");

    // Get any error messages
    const errors = await page.evaluate(() => {
      const errorElements = Array.from(
        document.querySelectorAll("p.text-red-600, [class*='text-red']")
      );
      return errorElements.map((el) => el.textContent);
    });

    // Get page body text for debugging
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log("\n" + "=".repeat(60));
    console.log("RESULTS:");
    console.log("- Success toast appeared:", hasSuccessToast);
    console.log("- Redirected to login:", isOnLoginPage);
    console.log("- Validation errors:", errors.length > 0 ? errors : "None");

    if (!hasSuccessToast && !isOnLoginPage) {
      console.log("\nPage content preview:");
      console.log(bodyText.substring(0, 500));
    }
    console.log("=".repeat(60));

    // Test assertions
    if (hasSuccessToast || isOnLoginPage) {
      console.log("\n✓ TEST PASSED: Registration successful!");
      expect(isOnLoginPage).toBe(true);
    } else if (errors.length > 0) {
      console.log("\n✗ TEST FAILED: Validation errors found");
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    } else {
      console.log("\n⚠ TEST UNCERTAIN: Check screenshots for details");
      console.log(
        "Screenshots saved: tc01-before-submit.png, tc01-after-submit.png"
      );

      // Check if API error occurred
      if (bodyText.includes("kết nối") || bodyText.includes("server")) {
        throw new Error(
          "API connection error - Is the backend running on port 5000?"
        );
      }

      // If we're still on register page with no errors, something went wrong
      if (finalUrl.includes("/auth/register")) {
        throw new Error(
          "Form did not submit - check browser console and screenshots"
        );
      }
    }
  });
});
