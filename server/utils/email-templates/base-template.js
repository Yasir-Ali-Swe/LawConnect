// const escapeHtml = (value = "") =>
//   String(value)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/\"/g, "&quot;")
//     .replace(/'/g, "&#39;");

// export const baseEmailTemplate = ({
//   name,
//   link,
//   title,
//   message,
//   ctaLabel,
//   ctaColor = "#2563eb",
//   appName = "LawConnect",
//   footerNote = "The link will expire in 15 minutes. If you did not request this email, you can safely ignore it.",
// }) => {
//   const safeName = escapeHtml(name || "there");
//   const safeTitle = escapeHtml(title || "Action Required");
//   const safeMessage = escapeHtml(
//     message || "Please review the details and continue using the button below."
//   );
//   const safeCtaLabel = escapeHtml(ctaLabel || "Continue");
//   const safeAppName = escapeHtml(appName);
//   const safeFooterNote = escapeHtml(footerNote);

//   return `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>${safeTitle}</title>
//   </head>
//   <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
//     <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f6fb; padding: 24px 12px;">
//       <tr>
//         <td align="center">
//           <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
//             <tr>
//               <td style="background-color: #0f172a; padding: 24px 28px; text-align: center;">
//                 <p style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 700; color: #ffffff;">${safeAppName}</p>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding: 28px 28px 20px 28px;">
//                 <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 22px; color: #4b5563;">Hello ${safeName},</p>
//                 <h1 style="margin: 0 0 14px 0; font-size: 24px; line-height: 32px; color: #111827; font-weight: 700;">${safeTitle}</h1>
//                 <p style="margin: 0; font-size: 16px; line-height: 26px; color: #374151;">${safeMessage}</p>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding: 0 28px 24px 28px;">
//                 <table role="presentation" cellpadding="0" cellspacing="0" border="0">
//                   <tr>
//                     <td align="center" bgcolor="${ctaColor}" style="border-radius: 10px;">
//                       <a href="${link}" style="display: inline-block; padding: 13px 22px; font-size: 15px; line-height: 18px; font-weight: 700; text-decoration: none; color: #ffffff; border-radius: 10px;">${safeCtaLabel}</a>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding: 0 28px 28px 28px;">
//                 <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6b7280;">${safeFooterNote}</p>
//               </td>
//             </tr>
//             <tr>
//               <td style="border-top: 1px solid #e5e7eb; padding: 14px 28px; text-align: center;">
//                 <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">© ${new Date().getFullYear()} ${safeAppName}. All rights reserved.</p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>`;
// };

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const baseEmailTemplate = ({
  name,
  link,
  title,
  message,
  ctaLabel,
  ctaColor = "#2563eb",
  appName = "LawConnect",
  footerNote = "The link will expire in 15 minutes. If you did not request this email, you can safely ignore it.",
  isHtmlMessage = false,
}) => {
  const safeName = escapeHtml(name || "there");
  const safeTitle = escapeHtml(title || "Action Required");

  const safeMessage = isHtmlMessage
    ? message
    : escapeHtml(
        message ||
          "Please review the details and continue using the button below.",
      );

  const safeCtaLabel = escapeHtml(ctaLabel || "Continue");
  const safeAppName = escapeHtml(appName);
  const safeFooterNote = escapeHtml(footerNote);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f6fb; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
            <tr>
              <td style="background-color: #0f172a; padding: 24px 28px; text-align: center;">
                <p style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 700; color: #ffffff;">
                  ${safeAppName}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 28px 20px 28px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 22px; color: #4b5563;">
                  Hello ${safeName},
                </p>

                <h1 style="margin: 0 0 14px 0; font-size: 24px; line-height: 32px; color: #111827; font-weight: 700;">
                  ${safeTitle}
                </h1>

                <div style="font-size: 16px; line-height: 26px; color: #374151;">
                  ${safeMessage}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="${ctaColor}" style="border-radius: 10px;">
                      <a
                        href="${link}"
                        style="display: inline-block; padding: 13px 22px; font-size: 15px; line-height: 18px; font-weight: 700; text-decoration: none; color: #ffffff; border-radius: 10px;"
                      >
                        ${safeCtaLabel}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 28px 28px 28px;">
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #6b7280;">
                  ${safeFooterNote}
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #e5e7eb; padding: 14px 28px; text-align: center;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                  © ${new Date().getFullYear()} ${safeAppName}. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
