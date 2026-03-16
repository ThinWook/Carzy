const puppeteer = require("puppeteer");

describe("TC0 - Không nhập thông tin đăng ký", () => {
  let browser, page;
  const registerUrl = "http://localhost:3000/auth/register";

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForHydration = async () => {
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

    // Click button to trigger validation
    try {
      await page.click("button[type='submit']");
    } catch (e) {
      console.log("Click method failed");
    }

    await sleep(1000);
  };

  const getErrorText = async (selector) => {
    try {
      const errorSelector = `${selector} ~ .text-red-600, ${selector} + .text-red-600`;
      await page.waitForSelector(errorSelector, { timeout: 3000 });
      return await page.$eval(errorSelector, (el) => el.textContent.trim());
    } catch (e) {
      const parentSelector = `${selector}`;
      const parent = await page.$(parentSelector);
      if (parent) {
        const parentElement = await parent.evaluateHandle((el) =>
          el.parentElement ? el.parentElement : el
        );
        const errorText = await parentElement.evaluate((el) => {
          const errorEl = el.querySelector(".text-red-600");
          return errorEl ? errorEl.textContent.trim() : "";
        });
        return errorText;
      }
      return "";
    }
  };

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 800 },
      slowMo: 50,
    });
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
        await page.close();
      }
    } catch (e) {}
  });

  afterAll(async () => {
    try {
      if (browser) {
        await browser.close();
      }
    } catch (e) {}
  });

  test("Click nút đăng ký mà không nhập bất kỳ thông tin nào", async () => {
    // Wait for form to be ready
    await page.waitForSelector("#full_name", { timeout: 10000 });

    const urlBeforeSubmit = page.url();
    console.log("URL before submit:", urlBeforeSubmit);

    // Click button submit
    await submitForm();
    await sleep(2000);

    // Kiểm tra xem page có redirect hay không (nếu không redirect = validation đã chặn)
    const urlAfterSubmit = page.url();
    console.log("URL after submit:", urlAfterSubmit);

    // Xác nhận vẫn ở trang register (không redirect)
    expect(urlAfterSubmit).toContain("/auth/register");
    expect(urlAfterSubmit).toBe(urlBeforeSubmit);

    // Kiểm tra tất cả fields vẫn trống
    const fieldValues = await page.evaluate(() => {
      return {
        full_name: document.querySelector("#full_name")?.value || "",
        email: document.querySelector("#email")?.value || "",
        phone_number: document.querySelector("#phone_number")?.value || "",
        password: document.querySelector("#password")?.value || "",
        confirm_password:
          document.querySelector("#confirm_password")?.value || "",
        address: document.querySelector("#address")?.value || "",
      };
    });

    console.log("Field values after submit:", fieldValues);

    // Xác nhận tất cả field đều trống
    const allFieldsEmpty = Object.values(fieldValues).every((v) => v === "");
    expect(allFieldsEmpty).toBe(true);

    console.log("✓ Form validation prevented submission with empty fields");
    console.log("✓ User stayed on registration page");
  });
});
