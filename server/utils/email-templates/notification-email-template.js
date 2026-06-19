import { baseEmailTemplate } from "./base-template.js";

export const notificationEmailTemplate = ({
  name,
  link,
  title,
  message,
}) => {
  return baseEmailTemplate({
    name,
    link,
    title: title || "New Notification",
    message:
      message ||
      "You have a new update in your account. Use the button below to view details.",
    ctaLabel: "View Update",
    ctaColor: "#7c3aed",
  });
};
