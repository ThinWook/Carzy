const { launchBrowser } = require("../helpers/puppeteer");
const { clickSubmit, openRegisterPage } = require("../helpers/ui-helpers");

jest.setTimeout(30000);

describe("Register UI - Complete Test Suite", () => {
  let browser;
  let page;

  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const registerUrl = `${base.replace(/\/$/, "")}/auth/register`;

  const mockUser = {
    _id: "user-1",
    full_name: "Test User",
    email: "test-register@example.com",
    phone_number: "0123456789",
    address: "123 Test St",
    role: "user",
    rating: 0,
    kyc_status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const waitForHydration = async () => {
    // Wait for form to actually exist (means React rendered)
    await page.waitForSelector("form", { timeout: 15000 });
    // Wait for our ClientOnly hydration flag
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
      // Fallback: wait for React to be ready
      await sleep(2000);
    }
  };

  const submitViaDom = async () => {
    // Instrument: count submit events
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form && !window.hasOwnProperty("__SUBMIT_COUNT__")) {
        window.__SUBMIT_COUNT__ = 0;
      }
      if (form) {
        form.addEventListener(
          "submit",
          () => {
            window.__SUBMIT_COUNT__ = (window.__SUBMIT_COUNT__ || 0) + 1;
          },
          { once: false }
        );
      }
    });
    // Prefer a real click on the submit button for maximal compatibility
    const btn = await page.$("button[type='submit'], input[type='submit']");
    if (btn) {
      await btn.click();
      // wait briefly to see if submit fired
      try {
        await page.waitForFunction(() => window.__SUBMIT_COUNT__ >= 1, {
          timeout: 1500,
        });
      } catch (e) {}
      return;
    }
    // Fallback to form.requestSubmit
    const usedForm = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form && typeof form.requestSubmit === "function") {
        form.requestSubmit();
        return true;
      }
      if (form) {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
        return true;
      }
      return false;
    });
    if (!usedForm) throw new Error("No form or submit button found");
    try {
      await page.waitForFunction(() => window.__SUBMIT_COUNT__ >= 1, {
        timeout: 1500,
      });
    } catch (e) {}
  };

  const getSiblingErrorText = async (selector) => {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const p =
        el && (el.closest("div") || el.parentElement)?.querySelector("p");
      return p ? (p.textContent || "").trim() : "";
    }, selector);
  };

  const waitForToastText = async (re) => {
    // react-hot-toast renders a container with class containing 'react-hot-toast'
    try {
      await page.waitForFunction(
        (pattern) => {
          const container = document.querySelector(
            '.react-hot-toast, [class*="react-hot-toast"]'
          );
          if (!container) return false;
          const text = container.innerText || "";
          try {
            return new RegExp(pattern).test(text);
          } catch (e) {
            return text.includes(pattern);
          }
        },
        { timeout: 10000 },
        re.source || re
      );
    } catch (e) {
      // Fallback to scanning body text
      await page.waitForFunction(
        (pattern) => {
          const text = document.body?.innerText || "";
          try {
            return new RegExp(pattern).test(text);
          } catch {
            return text.includes(pattern);
          }
        },
        { timeout: 4000 },
        re.source || re
      );
    }
  };

  beforeAll(async () => {
    browser = await launchBrowser();
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
  });

  afterEach(async () => {
    try {
      if (page && !page.isClosed()) await page.close();
    } catch (e) {}
  });

  // ==================== TEST CASE 1: Tạo tài khoản thành công ====================
  test("TC01 - Tạo tài khoản thành công", async () => {
    await page.setRequestInterception(true);

    const handler = (req) => {
      const url = req.url();
      if (req.method() === "POST" && url.includes("/auth/register")) {
        req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Tạo tài khoản thành công",
            user: mockUser,
          }),
        });
        return;
      }
      req.continue();
    };
    page.on("request", handler);

    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền đầy đủ thông tin hợp lệ
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address);
    await sleep(300);
    await submitViaDom();

    // Kiểm tra thông báo thành công
    await waitForToastText(/Tạo tài khoản thành công|Đăng ký thành công/);

    // Kiểm tra điều hướng tới trang đăng nhập
    await page.waitForFunction(
      () =>
        location &&
        location.pathname &&
        /\/auth\/login/.test(location.pathname),
      { timeout: 7000 }
    );

    const url = await page.evaluate(() => location.pathname + location.search);
    expect(url).toMatch(/\/auth\/login/);

    await page.setRequestInterception(false);
    page.off("request", handler);
  });

  // ==================== TEST CASE 2: Thiếu email ====================
  test("TC02 - Thiếu email", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền tất cả các trường ngoại trừ email
    await page.type("#full_name", mockUser.full_name);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address);

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi email
    await page.waitForFunction(
      () =>
        !!document.querySelector("#email") &&
        !!document.querySelector("#email").closest("div")?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#email")).toMatch(
      /Email là bắt buộc|Thiếu email/
    );
  });

  // ==================== TEST CASE 3: Thiếu mật khẩu ====================
  test("TC03 - Thiếu mật khẩu", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền tất cả các trường ngoại trừ password
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#address", mockUser.address);

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi password
    await page.waitForFunction(
      () =>
        !!document.querySelector("#password") &&
        !!document
          .querySelector("#password")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#password")).toMatch(
      /Mật khẩu là bắt buộc|Thiếu mật khẩu/
    );
  });

  // ==================== TEST CASE 4: Sai định dạng email ====================
  test("TC04 - Sai định dạng email", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#email", { timeout: 10000 });

    // Nhập email không hợp lệ
    await page.type("#email", "invalid-email-format");

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi định dạng email
    await page.waitForFunction(
      () =>
        !!document.querySelector("#email") &&
        !!document.querySelector("#email").closest("div")?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#email")).toMatch(
      /Email không hợp lệ|Sai định dạng email/
    );
  });

  // ==================== TEST CASE 5: Mật khẩu yếu ====================
  test("TC05 - Mật khẩu yếu", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#password", { timeout: 10000 });

    // Nhập mật khẩu ngắn (< 6 ký tự)
    await page.type("#password", "123");
    await page.type("#confirm_password", "123");

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi mật khẩu yếu
    await page.waitForFunction(
      () =>
        !!document.querySelector("#password") &&
        !!document
          .querySelector("#password")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#password")).toMatch(
      /Mật khẩu phải có ít nhất 6 ký tự|Mật khẩu yếu/
    );
  });

  // ==================== TEST CASE 6: Email đã tồn tại ====================
  test("TC06 - Email đã tồn tại", async () => {
    await page.setRequestInterception(true);

    const handler = (req) => {
      const url = req.url();
      if (req.method() === "POST" && url.includes("/auth/register")) {
        req.respond({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "Email đã tồn tại" }),
        });
        return;
      }
      req.continue();
    };
    page.on("request", handler);

    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền đầy đủ thông tin với email đã tồn tại
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", "existing@example.com");
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address);
    await sleep(300);
    await submitViaDom();

    // Kiểm tra thông báo lỗi email đã tồn tại
    await waitForToastText(/Email đã tồn tại/);

    await page.setRequestInterception(false);
    page.off("request", handler);
  });

  // ==================== TEST CASE 7: Thiếu địa chỉ ====================
  test("TC07 - Thiếu địa chỉ", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền tất cả các trường ngoại trừ địa chỉ
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi địa chỉ
    await page.waitForFunction(
      () =>
        !!document.querySelector("#address") &&
        !!document.querySelector("#address").closest("div")?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#address")).toMatch(
      /Địa chỉ là bắt buộc|Thiếu địa chỉ/
    );
  });

  // ==================== TEST CASE 8: Thiếu nhập lại mật khẩu ====================
  test("TC08 - Thiếu nhập lại mật khẩu", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Điền tất cả các trường ngoại trừ confirm_password
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#address", mockUser.address);

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi confirm password
    await page.waitForFunction(
      () =>
        !!document.querySelector("#confirm_password") &&
        !!document
          .querySelector("#confirm_password")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#confirm_password")).toMatch(
      /Xác nhận mật khẩu là bắt buộc|Thiếu nhập lại mật khẩu/
    );
  });

  // ==================== TEST CASE 9: Thiếu họ tên ====================
  test("TC09 - Thiếu họ tên", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#email", { timeout: 10000 });

    // Điền tất cả các trường ngoại trừ họ tên
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address);

    await submitViaDom();
    await sleep(1000);

    // Kiểm tra thông báo lỗi họ tên
    await page.waitForFunction(
      () =>
        !!document.querySelector("#full_name") &&
        !!document
          .querySelector("#full_name")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#full_name")).toMatch(
      /Họ tên là bắt buộc|Thiếu họ tên/
    );
  });

  // ==================== TEST CASE 10: Dữ liệu nhập quá kích thước cho phép ====================
  test("TC10 - Dữ liệu nhập quá kích thước cho phép", async () => {
    await page.setRequestInterception(true);

    const handler = (req) => {
      const url = req.url();
      if (req.method() === "POST" && url.includes("/auth/register")) {
        req.respond({
          status: 413,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Dữ liệu nhập quá kích thước cho phép",
          }),
        });
        return;
      }
      req.continue();
    };
    page.on("request", handler);

    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    // Nhập dữ liệu có kích thước lớn
    await page.type("#full_name", mockUser.full_name.repeat(50)); // Rất dài
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address.repeat(50)); // Rất dài
    await sleep(300);
    await submitViaDom();

    // Kiểm tra thông báo lỗi dữ liệu quá lớn
    await waitForToastText(/Dữ liệu nhập quá kích thước cho phép/);

    await page.setRequestInterception(false);
    page.off("request", handler);
  });

  // ==================== ADDITIONAL TESTS ====================

  test("Form renders all expected inputs and submit", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });

    const fullName = await page.$("#full_name");
    const email = await page.$("#email");
    const phone = await page.$("#phone_number");
    const password = await page.$("#password");
    const confirm = await page.$("#confirm_password");
    const address = await page.$("#address");
    const submit = await page.$("button[type='submit'], input[type='submit']");

    expect(fullName).toBeTruthy();
    expect(email).toBeTruthy();
    expect(phone).toBeTruthy();
    expect(password).toBeTruthy();
    expect(confirm).toBeTruthy();
    expect(address).toBeTruthy();
    expect(submit).toBeTruthy();
  });

  test("Thiếu trường bắt buộc hiển thị đúng thông báo", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("form", { timeout: 10000 });

    // Just submit the empty form - react-hook-form will validate
    await submitViaDom();
    await sleep(1500);

    // Debug: get HTML to see what's rendered
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML after submit:", html.substring(0, 2000));

    // Check if error paragraphs exist at all
    const errorCount = await page.evaluate(
      () =>
        document.querySelectorAll('p.text-red-600, p[class*="text-red"]').length
    );
    console.log("Error paragraphs found:", errorCount);

    // Wait and assert messages per field
    await page.waitForFunction(
      () =>
        !!document.querySelector("#full_name") &&
        !!document
          .querySelector("#full_name")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#full_name")).toMatch(
      /Họ tên là bắt buộc|Thiếu họ tên/
    );
    expect(await getSiblingErrorText("#email")).toMatch(
      /Email là bắt buộc|Thiếu email/
    );
    expect(await getSiblingErrorText("#password")).toMatch(
      /Mật khẩu là bắt buộc|Thiếu mật khẩu/
    );
    expect(await getSiblingErrorText("#confirm_password")).toMatch(
      /Xác nhận mật khẩu là bắt buộc|Thiếu nhập lại mật khẩu/
    );
    expect(await getSiblingErrorText("#address")).toMatch(
      /Địa chỉ là bắt buộc|Thiếu địa chỉ/
    );
  });

  test("Password and confirm mismatch shows error", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#confirm_password", { timeout: 10000 });
    await page.type("#password", "123456");
    await page.type("#confirm_password", "654321");
    // Submit to trigger validation
    await submitViaDom();
    await sleep(1000);
    await page.waitForFunction(
      () =>
        !!document.querySelector("#confirm_password") &&
        !!document
          .querySelector("#confirm_password")
          .closest("div")
          ?.querySelector("p"),
      { timeout: 10000 }
    );
    expect(await getSiblingErrorText("#confirm_password")).toMatch(
      /Mật khẩu không khớp/
    );
  });

  test("Submit shows loading and disables button when API is delayed (mock)", async () => {
    await page.setRequestInterception(true);

    const handler = (req) => {
      const url = req.url();
      if (req.method() === "POST" && url.includes("/auth/register")) {
        setTimeout(() => {
          req.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ message: "ok", user: mockUser }),
          });
        }, 1200);
        return;
      }
      req.continue();
    };
    page.on("request", handler);

    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#full_name", { timeout: 10000 });
    await page.type("#full_name", mockUser.full_name);
    await page.type("#email", mockUser.email);
    await page.type("#phone_number", mockUser.phone_number);
    await page.type("#password", "Password01");
    await page.type("#confirm_password", "Password01");
    await page.type("#address", mockUser.address);
    await sleep(200);
    await submitViaDom();

    // Button should be disabled and show loading text shortly after submit
    await page.waitForSelector("button[type='submit'][disabled]", {
      timeout: 10000,
    });
    const disabled = await page.$eval(
      "button[type='submit']",
      (el) => el.disabled
    );
    expect(disabled).toBe(true);
    const btnText = await page.$eval(
      "button[type='submit']",
      (b) => b.innerText
    );
    expect(btnText).toMatch(/Đang đăng ký|Đang đăng ký\.{0,3}/);

    await page.setRequestInterception(false);
    page.off("request", handler);
  });

  test("Confirm password input has type password", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#confirm_password", { timeout: 10000 });
    const type = await page.$eval("#confirm_password", (el) =>
      el.getAttribute("type")
    );
    expect(type).toBe("password");
  });

  test("Address field accepts value and reflects typed text", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("#address", { timeout: 10000 });
    await page.type("#address", "456 Another Rd");
    const val = await page.$eval("#address", (el) => el.value);
    expect(val).toBe("456 Another Rd");
  });

  test("Login link exists and points to /auth/login", async () => {
    await page.goto(registerUrl, { waitUntil: "networkidle2", timeout: 15000 });
    await waitForHydration();
    await page.waitForSelector("a[href='/auth/login']", { timeout: 10000 });
    const href = await page.$eval("a[href='/auth/login']", (a) =>
      a.getAttribute("href")
    );
    expect(href).toBe("/auth/login");
  });
});
