import nodemailer from "nodemailer";

export const sendOtpEmail = async (to: string, code: string) => {
  // Use mock logging if SMTP is not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n============================`);
    console.log(`✉️ Simulated Email Sent to ${to}`);
    console.log(`🔑 OTP CODE: ${code}`);
    console.log(`============================\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"NR Portfolio Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Login OTP Code",
    text: `Your OTP code is: ${code}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2>Admin Authentication</h2>
        <p>Your one-time password (OTP) to sign in is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #7c3aed; background: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
          ${code}
        </h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("SMTP Error: Could not send email. Falling back to console logging.");
    console.error(err);
    console.log(`\n============================`);
    console.log(`✉️ Simulated Email Sent to ${to}`);
    console.log(`🔑 OTP CODE: ${code}`);
    console.log(`============================\n`);
  }
};
