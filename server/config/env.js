import "dotenv/config";

const PORT = process.env.PORT || 5000;
const DB_CONNECTION = process.env.DB_CONNECTION;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BREVO_USER = process.env.BREVO_USER;
const BREVO_PASS = process.env.BREVO_PASS;
const BREVO_HOST = process.env.BREVO_HOST;
const BREVO_PORT = process.env.BREVO_PORT;
const NODE_ENV = process.env.NODE_ENV;

export {
  PORT,
  DB_CONNECTION,
  JWT_SECRET,
  EMAIL,
  EMAIL_PASSWORD,
  FRONTEND_URL,
  BREVO_USER,
  BREVO_PASS,
  BREVO_HOST,
  BREVO_PORT,
  NODE_ENV,
};
