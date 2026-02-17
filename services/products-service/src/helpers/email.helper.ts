import nodemailer from "nodemailer";
import config from "../config";
import ApiError from "../errors/ApiErrors";

const emailSender = async (subject: string, email: string, html: string) => {
  const emailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  const mailOptions = {
    from: `"Deshi Design" <${config.emailSender.email}>`,
    to: config.emailSender.email,
    subject,
    html,
  };

  // Send the email
  try {
    await emailTransport.sendMail(mailOptions);
  } catch (error: any) {
    if (error.responseCode === 550) {
      throw new ApiError(400, "Invalid email address or blocked sender");
    }

    if (error.responseCode === 421) {
      throw new ApiError(500, "Service temporarily unavailable");
    }
    throw new ApiError(500, "Error sending email");
  }
};

export default emailSender;
