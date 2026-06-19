import { baseEmailTemplate } from "./base-template.js";

export const verificationEmailTemplate = ({
  name,
  link,
  title,
  message,
}) => {
  return baseEmailTemplate({
    name,
    link,
    title: title || "Verify Your Email Address",
    message:
      message ||
      "Please confirm your email address to activate your account and continue securely.",
    ctaLabel: "Verify Email",
    ctaColor: "#2563eb",
  });
};
