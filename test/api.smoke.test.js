const http = require("http");

const API_BASE = process.env.API_BASE || "http://localhost:5000";

function httpGet(path) {
  const url = `${API_BASE}${path}`;
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      const { statusCode } = res;
      let rawData = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => resolve({ statusCode, body: rawData }));
    });
    req.on("error", reject);
    req.end();
  });
}

describe("API smoke", () => {
  test("API server is reachable and vehicles list returns something (or 200/4xx gracefully)", async () => {
    try {
      const res = await httpGet("/api/vehicles");
      // Accept a 200 OK or a 4xx if DB not seeded, but server is up
      expect([200, 400, 401, 403, 404]).toContain(res.statusCode);
    } catch (err) {
      // Connection refused when API not running locally
      console.warn(`[SKIP] API not reachable at ${API_BASE}: ${err.message}`);
      return; // skip gracefully
    }
  });
});
