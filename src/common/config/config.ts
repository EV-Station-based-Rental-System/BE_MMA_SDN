export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  database: {
    url: process.env.MONGO_URI,
  },
  gmail: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  features: {
    bypassOtp: ["1", "true", "yes"].includes(String(process.env.BYPASS_OTP || "").toLowerCase()),
    bypassEmail: ["1", "true", "yes"].includes(String(process.env.BYPASS_EMAIL || "").toLowerCase()),
    bypassUpload: ["1", "true", "yes"].includes(String(process.env.BYPASS_UPLOAD || "").toLowerCase()),
  },
});
