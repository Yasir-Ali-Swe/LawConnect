import nodeMailer from "nodemailer";
import {
  EMAIL,
  EMAIL_PASSWORD,
  BREVO_USER,
  BREVO_PASS,
  BREVO_HOST,
  BREVO_PORT,
} from "../config/env.js";

// const transporter = nodeMailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: EMAIL,
//         pass: EMAIL_PASSWORD,
//     },
// });

const transporter = nodeMailer.createTransport({
  host: BREVO_HOST,
  port: BREVO_PORT,
  auth: {
    user: BREVO_USER,
    pass: BREVO_PASS,
  },
});
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      // from: EMAIL,
      from: "LawConnect <ali.yasirswe@gmail.com>",
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
