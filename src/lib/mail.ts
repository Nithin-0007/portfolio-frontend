import { Resend } from "resend";

type OtpPurpose = "login" | "register" | "forgot-password";

const CONFIG: Record<OtpPurpose, { subject: string; heading: string; description: string; color: string }> = {
  login: {
    subject: "Your Login OTP – PortfolioOS",
    heading: "Sign In Verification",
    description: "Use this one-time code to sign in to your PortfolioOS account:",
    color: "#7c3aed",
  },
  register: {
    subject: "Verify Your Email – PortfolioOS",
    heading: "Email Verification",
    description: "Enter this code to verify your email address and complete registration:",
    color: "#06b6d4",
  },
  "forgot-password": {
    subject: "Reset Your Password – PortfolioOS",
    heading: "Password Reset",
    description: "Use this code to reset your PortfolioOS account password:",
    color: "#ec4899",
  },
};

function buildEmailHtml(code: string, purpose: OtpPurpose): string {
  const { heading, description, color } = CONFIG[purpose];
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#080f1f;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${color} 0%,#06b6d4 100%);padding:32px 36px;text-align:center;">
            <span style="font-size:1.4rem;font-weight:800;color:white;">PortfolioOS</span><br/>
            <span style="font-size:1.1rem;font-weight:600;color:rgba(255,255,255,0.85);">${heading}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 36px;text-align:center;">
            <p style="color:#94a3b8;font-size:0.95rem;margin:0 0 28px;line-height:1.6;">${description}</p>
            <div style="background:rgba(124,58,237,0.1);border:2px solid rgba(124,58,237,0.35);border-radius:14px;padding:24px 32px;display:inline-block;margin-bottom:28px;">
              <span style="font-size:2.8rem;font-weight:900;letter-spacing:12px;color:#a78bfa;font-family:monospace;">${code}</span>
            </div>
            <p style="color:#64748b;font-size:0.85rem;margin:0 0 8px;">⏱ This code expires in <strong style="color:#94a3b8;">10 minutes</strong></p>
            <p style="color:#475569;font-size:0.8rem;margin:0;">If you didn't request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid rgba(255,255,255,0.06);padding:18px 36px;text-align:center;">
            <p style="color:#1e293b;font-size:0.75rem;margin:0;">Automated security email from PortfolioOS · Do not reply</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: OtpPurpose = "login"
): Promise<void> {
  // Dev fallback — no API key configured
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`[DEV] OTP Email → ${to}`);
    console.log(`[DEV] Purpose  : ${purpose}`);
    console.log(`[DEV] OTP Code : ${code}`);
    console.log(`${"=".repeat(50)}\n`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY.trim());
  const from   = (process.env.RESEND_FROM || "PortfolioOS <onboarding@resend.dev>").trim();
  const { subject } = CONFIG[purpose];

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildEmailHtml(code, purpose),
    text: `Your ${purpose} OTP is: ${code}. It expires in 10 minutes. Do not share this code.`,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
