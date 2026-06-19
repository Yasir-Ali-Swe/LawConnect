import { baseEmailTemplate } from "./base-template.js";

export const resetPasswordEmailTemplate = ({
  name,
  link,
  title,
  message,
}) => {
  return baseEmailTemplate({
    name,
    link,
    title: title || "Reset Your Password",
    message:
      message ||
      "We received a request to reset your password. Use the secure button below to choose a new password.",
    ctaLabel: "Reset Password",
    ctaColor: "#dc2626",
  });
};
