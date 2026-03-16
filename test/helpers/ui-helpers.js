const { launchBrowser } = require("./puppeteer");

async function clickSubmit(page) {
  // Try to click a submit button using CSS selectors first.
  const btn = await page.$("button[type='submit'], input[type='submit']");
  if (btn) {
    await btn.focus();
    await btn.click();
    return;
  }

  // Fallback: click button by visible text using page.evaluate to avoid XPath
  const clicked = await page.evaluate(() => {
    const texts = ["Đăng ký", "Submit", "Register"];
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const b of buttons) {
      const t = (b.innerText || "").trim();
      if (texts.includes(t) || texts.some((x) => t.includes(x))) {
        b.click();
        return true;
      }
    }
    return false;
  });

  if (!clicked) {
    // fallback: press Enter on focused element
    await page.keyboard.press("Enter");
  }
}

async function typeByPlaceholder(page, placeholder, value) {
  // Use page.evaluate to find input/textarea by placeholder or aria-label and set value
  const ok = await page.evaluate(
    ({ placeholder, value }) => {
      const esc = placeholder;
      const input = Array.from(
        document.querySelectorAll("input, textarea")
      ).find((el) => {
        const ph = el.getAttribute("placeholder");
        const al = el.getAttribute("aria-label");
        return ph === esc || al === esc;
      });
      if (!input) return false;
      input.focus();
      input.value = String(value);
      const ev = new Event("input", { bubbles: true });
      input.dispatchEvent(ev);
      const ev2 = new Event("change", { bubbles: true });
      input.dispatchEvent(ev2);
      return true;
    },
    { placeholder, value }
  );
  return ok;
}

async function openRegisterPage(page, base = "http://localhost:3000") {
  const url = `${base.replace(/\/$/, "")}/auth/register`;
  await page.goto(url, { waitUntil: "networkidle2" });
}

module.exports = { clickSubmit, typeByPlaceholder, openRegisterPage };
