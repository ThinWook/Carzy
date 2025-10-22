// Increase default timeout and add small helpers if needed
jest.setTimeout(60000);

// If running headful in CI, allow overriding via env
process.env.PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS ?? "new";
