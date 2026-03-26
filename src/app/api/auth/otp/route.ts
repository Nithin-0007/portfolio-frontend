import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// ─── DB-backed OTP helpers ────────────────────────────────────────────────────

async function saveOtp(email: string, purpose: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otp.upsert({
    where: { email_purpose: { email, purpose } },
    update: { code, expiresAt, createdAt: new Date() },
    create: { email, code, purpose, expiresAt },
  });
  return code;
}

async function verifyOtp(email: string, purpose: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const stored = await prisma.otp.findUnique({ where: { email_purpose: { email, purpose } } });
  if (!stored) return { ok: false, error: "No OTP requested for this email" };
  if (new Date() > stored.expiresAt) {
    await prisma.otp.delete({ where: { email_purpose: { email, purpose } } }).catch(() => {});
    return { ok: false, error: "OTP has expired. Please request a new one." };
  }
  if (stored.code !== code.trim()) return { ok: false, error: "Invalid OTP code" };
  await prisma.otp.delete({ where: { email_purpose: { email, purpose } } }).catch(() => {});
  return { ok: true };
}

// Lazy Cognito client — only created when actually used at runtime
function getCognito() {
  return new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || "us-east-1" });
}
function getPoolId() { return process.env.COGNITO_USER_POOL_ID || ""; }
function getClientId() { return process.env.COGNITO_CLIENT_ID || ""; }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      // ── Send OTP (email or phone) ──────────────────────────────────────
      case "send-otp": {
        const { identifier } = body;
        if (!identifier) return NextResponse.json({ error: "identifier required" }, { status: 400 });
        await getCognito().send(new ForgotPasswordCommand({ ClientId: getClientId(), Username: identifier }));
        return NextResponse.json({ success: true, message: "OTP sent" });
      }

      // ── Verify OTP + sign in ───────────────────────────────────────────
      case "verify-otp": {
        const { identifier, otp, newPassword } = body;
        if (!identifier || !otp || !newPassword)
          return NextResponse.json({ error: "identifier, otp, newPassword required" }, { status: 400 });
        await getCognito().send(new ConfirmForgotPasswordCommand({
          ClientId: getClientId(),
          Username: identifier,
          ConfirmationCode: otp,
          Password: newPassword,
        }));
        // Sync password to Prisma so NextAuth credentials still work
        const hashed = await bcrypt.hash(newPassword, 10);
        const isEmail = identifier.includes("@");
        await prisma.user.updateMany({
          where: isEmail ? { email: identifier } : { phone: identifier },
          data: { password: hashed },
        });
        return NextResponse.json({ success: true });
      }

      // ── Invite user (admin only) ───────────────────────────────────────
      case "invite": {
        const session = await auth();
        if ((session?.user as any)?.role !== "ADMIN")
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { name, email, phone, role, username } = body;
        if (!name || (!email && !phone) || !username)
          return NextResponse.json({ error: "name, username, and email or phone required" }, { status: 400 });

        const cognitoUsername = email || phone;
        const tempPassword = `Temp${Math.random().toString(36).slice(2, 8)}!1`;

        // Create in Cognito
        await getCognito().send(new AdminCreateUserCommand({
          UserPoolId: getPoolId(),
          Username: cognitoUsername,
          TemporaryPassword: tempPassword,
          MessageAction: "SUPPRESS", // we send our own email via SES
          UserAttributes: [
            { Name: "name", Value: name },
            { Name: "custom:username", Value: username },
            { Name: "custom:role", Value: role || "VIEWER" },
            ...(email ? [{ Name: "email", Value: email }, { Name: "email_verified", Value: "true" }] : []),
            ...(phone ? [{ Name: "phone_number", Value: phone }, { Name: "phone_number_verified", Value: "true" }] : []),
          ],
        }));

        // Force permanent password so user can log in immediately
        await getCognito().send(new AdminSetUserPasswordCommand({
          UserPoolId: getPoolId(),
          Username: cognitoUsername,
          Password: tempPassword,
          Permanent: true,
        }));

        // Create in Prisma
        const hashed = await bcrypt.hash(tempPassword, 10);
        const existingUser = await prisma.user.findFirst({
          where: { OR: [{ email: email || "" }, { username }] },
        });

        let prismaUser;
        if (!existingUser) {
          prismaUser = await prisma.user.create({
            data: {
              username,
              name,
              email: email || `${username}@temp.local`,
              phone: phone || undefined,
              password: hashed,
              role: (role === "ADMIN" ? "ADMIN" : "VIEWER") as any,
              status: "ACTIVE",
            },
          });
          // Default portfolio content
          await Promise.all([
            prisma.heroContent.create({ data: { userId: prismaUser.id, name } }),
            prisma.aboutContent.create({ data: { userId: prismaUser.id, email: email || "", bio1: "", bio2: "" } }),
            prisma.siteSettings.create({ data: { userId: prismaUser.id } }),
          ]);
        } else {
          prismaUser = existingUser;
        }

        return NextResponse.json({ success: true, userId: prismaUser.id, tempPassword });
      }

      // ── List users (admin only) ────────────────────────────────────────
      case "list": {
        const session = await auth();
        if ((session?.user as any)?.role !== "ADMIN")
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const users = await prisma.user.findMany({
          select: { id: true, name: true, email: true, phone: true, role: true, status: true, lastLogin: true, createdAt: true, username: true },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ users });
      }

      // ── Update user (admin only) ───────────────────────────────────────
      case "update": {
        const session = await auth();
        if ((session?.user as any)?.role !== "ADMIN")
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id, name, role, status } = body;
        const updated = await prisma.user.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(role && { role: role as any }),
            ...(status && { status: status as any }),
          },
        });

        // Sync status to Cognito
        const cognitoUsername = updated.email || updated.phone;
        if (cognitoUsername && status) {
          if (status === "INACTIVE") {
            await getCognito().send(new AdminDisableUserCommand({ UserPoolId: getPoolId(), Username: cognitoUsername })).catch(() => {});
          } else if (status === "ACTIVE") {
            await getCognito().send(new AdminEnableUserCommand({ UserPoolId: getPoolId(), Username: cognitoUsername })).catch(() => {});
          }
        }
        return NextResponse.json({ success: true });
      }

      // ── Delete user (admin only) ───────────────────────────────────────
      case "delete": {
        const session = await auth();
        if ((session?.user as any)?.role !== "ADMIN")
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { id } = body;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const cognitoUsername = user.email || user.phone;
        if (cognitoUsername) {
          await getCognito().send(new AdminDeleteUserCommand({ UserPoolId: getPoolId(), Username: cognitoUsername })).catch(() => {});
        }
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }

      // ── Register: Send OTP to verify email before signup ──────────────
      case "register-send": {
        const { email } = body;
        if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
        if (!email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });

        // Check if email is already registered
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

        const code = await saveOtp(email, "register");
        await sendOtpEmail(email, code);

        return NextResponse.json({ success: true, message: "OTP sent to your email." });
      }

      // ── Forgot Password: Send OTP to email ────────────────────────────
      case "forgot-send": {
        const { email } = body;
        if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

        // Check user exists (always return success to avoid email enumeration)
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          const code = await saveOtp(email, "forgot-password");
          await sendOtpEmail(email, code);
        }

        return NextResponse.json({ success: true, message: "If this email is registered, an OTP has been sent." });
      }

      // ── Forgot Password: Verify OTP + Reset Password ──────────────────
      case "forgot-verify": {
        const { email, otp, newPassword } = body;
        if (!email || !otp || !newPassword)
          return NextResponse.json({ error: "email, otp, and newPassword required" }, { status: 400 });

        const result = await verifyOtp(email, "forgot-password", otp);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

        const hashed = await bcrypt.hash(newPassword, 10);
        const updated = await prisma.user.updateMany({
          where: { email },
          data: { password: hashed },
        });
        if (updated.count === 0)
          return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Password reset successfully." });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("OTP/User API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
