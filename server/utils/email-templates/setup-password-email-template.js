// import { baseEmailTemplate } from "./base-template.js";

// export const setupPasswordEmailTemplate = ({ name, link, title, message }) => {
//   return baseEmailTemplate({
//     name,
//     link,
//     title: title,
//     message: message,
//     ctaLabel: "Login",
//     ctaColor: "#059669",
//     footerNote: "Team LawConnect.",
//   });
// };

import { baseEmailTemplate } from "./base-template.js";

export const setupPasswordEmailTemplate = ({ name, link, title, message }) => {
  return baseEmailTemplate({
    name,
    link,
    title,
    message,
    isHtmlMessage: true,
    ctaLabel: "Login",
    ctaColor: "#059669",
    footerNote: "Team LawConnect.",
  });
};
