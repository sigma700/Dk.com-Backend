import https from "https";
// ── helpers ──────────────────────────────────────────────────
export const paystackRequest = (path, payload) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON response"));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

// ── M-Pesa charge ─────────────────────────────────────────────
