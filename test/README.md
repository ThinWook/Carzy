# Tests

This folder contains basic smoke tests using Jest and Puppeteer:

- api.smoke.test.js: Checks that the API server responds on http://localhost:5000.
- web.smoke.test.js: Opens the Next.js web app on http://localhost:3000 and asserts key text exists.

Requirements:

- Start the services in separate terminals before running tests:
  - API: npm run api (listens on port 5000 by default)
  - Web: npm run web (listens on port 3000 by default)

Run tests from the repo root:

```bash
npm test
```

Environment variables (optional):

- API_BASE: Override API base URL (default http://localhost:5000)
- WEB_BASE: Override Web base URL (default http://localhost:3000)
- PUPPETEER_HEADLESS=false to see the browser.
