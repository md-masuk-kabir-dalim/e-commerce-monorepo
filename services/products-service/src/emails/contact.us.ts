export const contactUsEmail = (
  name: string,
  email: string,
  subject: string,
  companyName: string | undefined,
  message: string,
  whatsAppNumber: string | undefined
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Request</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#fafafa; color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0;">
    <tr>
      <td align="center">

        <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background:#A40609; padding:32px;">
              <h1 style="color:#fff; font-size:24px; margin:0;">📩 You’ve Got a New Message</h1>
              <p style="color:#fbeaea; font-size:14px; margin-top:6px;">
                Someone reached out via your contact form
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px;">
              
              <p style="font-size:17px; margin:0 0 16px;">
                Hello Deshi Design Team,
              </p>

              <p style="font-size:15px; color:#555; margin:0 0 24px;">
                You have received a new message from your website. Here are the details:
              </p>

              <!-- Details Box -->
              <div style="background:#fff5f5; padding:16px 20px; border-left:5px solid #A40609; border-radius:8px; margin-bottom:24px;">
                <p style="margin:8px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin:8px 0;"><strong>Email:</strong> ${email}</p>
               <p style="margin:8px 0;"><strong>Company:</strong> ${
                 companyName ?? "N/A"
               }</p>
                <p style="margin:8px 0;"><strong>WhatsApp:</strong> ${
                  whatsAppNumber ?? "N/A"
                }</p>
                <p style="margin:8px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>

              <!-- Message -->
              <p style="font-size:14px; font-weight:600; color:#A40609; margin-bottom:8px;">
                Message
              </p>
              <div style="background:#fdfdfd; padding:16px 18px; border-radius:8px; font-size:15px; line-height:1.6; color:#444; white-space:pre-line;">
                ${message}
              </div>

              <p style="font-size:13px; color:#777; margin-top:24px;">
                This message was sent via your website’s contact form.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f7f7f7; padding:14px;">
              <p style="margin:0; font-size:12px; color:#666;">
                © ${new Date().getFullYear()} Deshi Design
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
