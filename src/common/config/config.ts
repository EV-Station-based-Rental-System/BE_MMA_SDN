export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  database: {
    url: process.env.MONGO_URI,
  },
});
