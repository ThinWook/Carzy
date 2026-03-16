/**
 * UI Test Suite for Register Page
 * Test Coverage: 10 main test cases + additional validation tests
 * Framework: Jest + Puppeteer
 */

const { launchBrowser } = require("../helpers/puppeteer");

jest.setTimeout(30000);

describe("Register Page - Complete UI Test Suite", () => {
  let browser;
  let page;

  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const registerUrl = `${base.replace(/\/$/, "")}/auth/register`;

  const validUser = {
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone_number: "0901234567",
    password: "Password123",
    confirm_password: "Password123",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  };

  const mockUserResponse = {
    _id: "user-1",
    full_name: validUser.full_name,
    email: validUser.email,
    phone_number: validUser.phone_number,
    address: validUser.address,
    role: "user",
    rating: 0,
    kyc_status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Helper functions
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

    // Prefer a real click on the submit button
    const btn = await page.$("button[type='submit'], input[type='submit']");
    if (btn) {
      await btn.click();
      // wait briefly to see if submit fired
      try {
        await page.waitForFunction(() => window.__SUBMIT_COUNT__ >= 1, {
          timeout: 1500,
        });
      } catch (e) {}
      await sleep(500);
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

    if (!usedForm) {
      throw new Error("No form or submit button found");
    }

    try {
      await page.waitForFunction(() => window.__SUBMIT_COUNT__ >= 1, {
        timeout: 1500,
      });
    } catch (e) {}
    await sleep(500);
  };

  const getErrorText = async (selector) => {
    // Wait for error to appear
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
    } catch (e) {
      // If no error appears, return empty string
    }

    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const errorParagraph = el?.closest("div")?.querySelector("p");
      return errorParagraph ? errorParagraph.textContent.trim() : "";
    }, selector);
  };

  const waitForToast = async (pattern) => {
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
        { timeout: 10000 },
        pattern
      );
    } catch (e) {
      await page.waitForFunction(
        (regex) => {
          const text = document.body?.innerText || "";
          return new RegExp(regex).test(text);
        },
        { timeout: 5000 },
        pattern
      );
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

  // ==================== TEST CASE 1: Tạo tài khoản thành công ====================
  describe("TC01 - Tạo tài khoản thành công", () => {
    test("Đăng ký với đầy đủ thông tin hợp lệ và chuyển tới trang đăng nhập", async () => {
      await page.setRequestInterception(true);

      const handler = (req) => {
        if (req.method() === "POST" && req.url().includes("/auth/register")) {
          req.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              message: "Tạo tài khoản thành công",
              user: mockUserResponse,
            }),
          });
        } else {
          req.continue();
        }
      };
      page.on("request", handler);

      await page.waitForSelector("#full_name", { timeout: 10000 });
      await fillForm(validUser);
      await sleep(300);
      await submitForm();

      // Kiểm tra thông báo thành công
      await waitForToast("Tạo tài khoản thành công|Đăng ký thành công");

      // Kiểm tra chuyển hướng
      await page.waitForFunction(
        () => location.pathname.includes("/auth/login"),
        { timeout: 7000 }
      );
      const url = page.url();
      expect(url).toContain("/auth/login");

      page.off("request", handler);
    });
  });

  // ==================== TEST CASE 2: Thiếu email ====================
  describe("TC02 - Thiếu email", () => {
    test("Không nhập email và submit form", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: "", // Không nhập email
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: validUser.confirm_password,
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#email");
      expect(errorText).toMatch(/Email là bắt buộc|Thiếu email/);
    });
  });

  // ==================== TEST CASE 3: Thiếu mật khẩu ====================
  describe("TC03 - Thiếu mật khẩu", () => {
    test("Không nhập mật khẩu và submit form", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: "", // Không nhập password
        confirm_password: "",
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#password");
      expect(errorText).toMatch(/Mật khẩu là bắt buộc|Thiếu mật khẩu/);
    });
  });

  // ==================== TEST CASE 4: Sai định dạng email ====================
  describe("TC04 - Sai định dạng email", () => {
    test("Nhập email không đúng định dạng", async () => {
      await page.waitForSelector("#email", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: "invalid-email-format", // Email không hợp lệ
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: validUser.confirm_password,
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#email");
      expect(errorText).toMatch(/Email không hợp lệ|Sai định dạng email/);
    });

    test("Nhập email thiếu @", async () => {
      await page.waitForSelector("#email", { timeout: 10000 });
      await page.type("#email", "invalidemail.com");
      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#email");
      expect(errorText).toMatch(/Email không hợp lệ/);
    });

    test("Nhập email thiếu domain", async () => {
      await page.waitForSelector("#email", { timeout: 10000 });
      await page.type("#email", "invalid@");
      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#email");
      expect(errorText).toMatch(/Email không hợp lệ/);
    });
  });

  // ==================== TEST CASE 5: Mật khẩu yếu ====================
  describe("TC05 - Mật khẩu yếu", () => {
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
      expect(errorText).toMatch(
        /Mật khẩu phải có ít nhất 6 ký tự|Mật khẩu yếu/
      );
    });

    test("Nhập mật khẩu chính xác 5 ký tự", async () => {
      await page.waitForSelector("#password", { timeout: 10000 });
      await page.type("#password", "12345");
      await page.type("#confirm_password", "12345");
      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#password");
      expect(errorText).toMatch(/Mật khẩu phải có ít nhất 6 ký tự/);
    });

    test("Nhập mật khẩu chính xác 6 ký tự (boundary test - should pass)", async () => {
      await page.waitForSelector("#password", { timeout: 10000 });
      await page.type("#password", "123456");
      await page.type("#confirm_password", "123456");
      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#password");
      // 6 ký tự là hợp lệ nên không có lỗi về độ dài
      expect(errorText).not.toMatch(/Mật khẩu phải có ít nhất 6 ký tự/);
    });
  });

  // ==================== TEST CASE 6: Email đã tồn tại ====================
  describe("TC06 - Email đã tồn tại", () => {
    test("Đăng ký với email đã được sử dụng", async () => {
      await page.setRequestInterception(true);

      const handler = (req) => {
        if (req.method() === "POST" && req.url().includes("/auth/register")) {
          req.respond({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ message: "Email đã tồn tại" }),
          });
        } else {
          req.continue();
        }
      };
      page.on("request", handler);

      await page.waitForSelector("#full_name", { timeout: 10000 });
      await fillForm({
        ...validUser,
        email: "existing@example.com", // Email đã tồn tại
      });
      await sleep(300);
      await submitForm();

      // Kiểm tra thông báo lỗi
      await waitForToast("Email đã tồn tại");

      page.off("request", handler);
    });
  });

  // ==================== TEST CASE 7: Thiếu địa chỉ ====================
  describe("TC07 - Thiếu địa chỉ", () => {
    test("Không nhập địa chỉ và submit form", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: validUser.confirm_password,
        address: "", // Không nhập địa chỉ
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#address");
      expect(errorText).toMatch(/Địa chỉ là bắt buộc|Thiếu địa chỉ/);
    });
  });

  // ==================== TEST CASE 8: Thiếu nhập lại mật khẩu ====================
  describe("TC08 - Thiếu nhập lại mật khẩu", () => {
    test("Không nhập xác nhận mật khẩu và submit form", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: "", // Không nhập confirm password
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#confirm_password");
      expect(errorText).toMatch(
        /Xác nhận mật khẩu là bắt buộc|Thiếu nhập lại mật khẩu/
      );
    });

    test("Nhập mật khẩu và xác nhận không khớp", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: validUser.full_name,
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: "Password123",
        confirm_password: "Password456", // Không khớp
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#confirm_password");
      expect(errorText).toMatch(/Mật khẩu không khớp/);
    });
  });

  // ==================== TEST CASE 9: Thiếu họ tên ====================
  describe("TC09 - Thiếu họ tên", () => {
    test("Không nhập họ tên và submit form", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });

      await fillForm({
        full_name: "", // Không nhập họ tên
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: validUser.confirm_password,
        address: validUser.address,
      });

      await submitForm();
      await sleep(1000);

      const errorText = await getErrorText("#full_name");
      expect(errorText).toMatch(/Họ tên là bắt buộc|Thiếu họ tên/);
    });
  });

  // ==================== TEST CASE 10: Dữ liệu nhập quá kích thước cho phép ====================
  describe("TC10 - Dữ liệu nhập quá kích thước cho phép", () => {
    test("Nhập dữ liệu có kích thước rất lớn", async () => {
      await page.setRequestInterception(true);

      const handler = (req) => {
        if (req.method() === "POST" && req.url().includes("/auth/register")) {
          req.respond({
            status: 413,
            contentType: "application/json",
            body: JSON.stringify({
              message: "Dữ liệu nhập quá kích thước cho phép",
            }),
          });
        } else {
          req.continue();
        }
      };
      page.on("request", handler);

      await page.waitForSelector("#full_name", { timeout: 10000 });

      // Nhập dữ liệu rất dài
      const longString = "A".repeat(1000);
      await fillForm({
        full_name: longString,
        email: validUser.email,
        phone_number: validUser.phone_number,
        password: validUser.password,
        confirm_password: validUser.confirm_password,
        address: longString,
      });

      await sleep(300);
      await submitForm();

      // Kiểm tra thông báo lỗi
      await waitForToast("Dữ liệu nhập quá kích thước cho phép");

      page.off("request", handler);
    });
  });

  // ==================== ADDITIONAL VALIDATION TESTS ====================
  describe("Additional UI Validation Tests", () => {
    test("Form renders all required input fields", async () => {
      const fullName = await page.$("#full_name");
      const email = await page.$("#email");
      const phone = await page.$("#phone_number");
      const password = await page.$("#password");
      const confirm = await page.$("#confirm_password");
      const address = await page.$("#address");
      const submit = await page.$("button[type='submit']");

      expect(fullName).toBeTruthy();
      expect(email).toBeTruthy();
      expect(phone).toBeTruthy();
      expect(password).toBeTruthy();
      expect(confirm).toBeTruthy();
      expect(address).toBeTruthy();
      expect(submit).toBeTruthy();
    });

    test("Password fields have type='password'", async () => {
      const passwordType = await page.$eval("#password", (el) => el.type);
      const confirmPasswordType = await page.$eval(
        "#confirm_password",
        (el) => el.type
      );

      expect(passwordType).toBe("password");
      expect(confirmPasswordType).toBe("password");
    });

    test("Email field has type='email'", async () => {
      const emailType = await page.$eval("#email", (el) => el.type);
      expect(emailType).toBe("email");
    });

    test("Phone field has type='tel'", async () => {
      const phoneType = await page.$eval("#phone_number", (el) => el.type);
      expect(phoneType).toBe("tel");
    });

    test("Link to login page exists", async () => {
      const loginLink = await page.$("a[href='/auth/login']");
      expect(loginLink).toBeTruthy();

      const href = await page.$eval("a[href='/auth/login']", (a) => a.href);
      expect(href).toContain("/auth/login");
    });

    test("Submit button shows loading state", async () => {
      await page.setRequestInterception(true);

      const handler = (req) => {
        if (req.method() === "POST" && req.url().includes("/auth/register")) {
          // Delay response to test loading state
          setTimeout(() => {
            req.respond({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ message: "ok", user: mockUserResponse }),
            });
          }, 1500);
        } else {
          req.continue();
        }
      };
      page.on("request", handler);

      await page.waitForSelector("#full_name", { timeout: 10000 });
      await fillForm(validUser);
      await sleep(200);
      await submitForm();

      // Check button is disabled and shows loading text
      await page.waitForSelector("button[type='submit'][disabled]", {
        timeout: 5000,
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
      expect(btnText).toMatch(/Đang đăng ký/);

      page.off("request", handler);
    });

    test("All fields accept input correctly", async () => {
      await page.waitForSelector("#full_name", { timeout: 10000 });
      await fillForm(validUser);

      const fullNameValue = await page.$eval("#full_name", (el) => el.value);
      const emailValue = await page.$eval("#email", (el) => el.value);
      const phoneValue = await page.$eval("#phone_number", (el) => el.value);
      const addressValue = await page.$eval("#address", (el) => el.value);

      expect(fullNameValue).toBe(validUser.full_name);
      expect(emailValue).toBe(validUser.email);
      expect(phoneValue).toBe(validUser.phone_number);
      expect(addressValue).toBe(validUser.address);
    });

    test("Submit all fields empty shows all error messages", async () => {
      await page.waitForSelector("form", { timeout: 10000 });
      await submitForm();
      await sleep(1500);

      const fullNameError = await getErrorText("#full_name");
      const emailError = await getErrorText("#email");
      const passwordError = await getErrorText("#password");
      const confirmPasswordError = await getErrorText("#confirm_password");
      const addressError = await getErrorText("#address");

      expect(fullNameError).toBeTruthy();
      expect(emailError).toBeTruthy();
      expect(passwordError).toBeTruthy();
      expect(confirmPasswordError).toBeTruthy();
      expect(addressError).toBeTruthy();
    });
  });
});
