import nodeMailer from "nodemailer";
import {
  EMAIL,
  EMAIL_PASSWORD,
  FRONTEND_URL,
  BREVO_USER,
  BREVO_PASS,
  BREVO_HOST,
  BREVO_PORT,
} from "../config/env.js";
import { verificationEmailTemplate } from "./email-templates/verification-email-template.js";

export const sendVerificationEmail = async (toEmail, token, name = "there") => {
  try {
    // const transporter = nodeMailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: EMAIL,
    //     pass: EMAIL_PASSWORD,
    //   },
    // });
    const transporter = nodeMailer.createTransport({
      host: BREVO_HOST,
      port: BREVO_PORT,
      auth: {
        user: BREVO_USER,
        pass: BREVO_PASS,
      },
    });
    const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      // from: EMAIL,
      from: "LawConnect <ali.yasirswe@gmail.com>",
      to: toEmail,
      subject: "Email Verification",
      html: verificationEmailTemplate({
        name,
        link: verificationLink,
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to", toEmail);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
