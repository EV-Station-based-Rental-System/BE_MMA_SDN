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
  // image_kit: {
  //   publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  //   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  //   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  // },
});
