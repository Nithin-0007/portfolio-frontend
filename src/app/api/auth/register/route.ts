import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, name, identifier, password, otpCode } = await req.json();

    // Validate input
    if (!username || !name || !identifier || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Block reserved usernames
    const reserved = ["admin", "api", "register", "login", "dashboard", "settings", "www", "app", "help", "support", "about", "contact"];
    if (reserved.includes(username.toLowerCase())) {
      return NextResponse.json({ error: "This username is reserved. Please choose another." }, { status: 400 });
    }

    // Validate username format
    if (!/^[a-z0-9-]+$/.test(username) || username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: "Username must be 3-30 characters, lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    // Determine if identifier is email or phone
    const isEmail = identifier.includes("@");
    const email = isEmail ? identifier : "";
    const phone = !isEmail ? identifier : "";

    // For email sign-ups, verify OTP before creating account
    if (isEmail) {
      if (!otpCode) {
        return NextResponse.json({ error: "OTP verification required. Please verify your email first." }, { status: 400 });
      }
      const stored = await prisma.otp.findUnique({
        where: { email_purpose: { email, purpose: "register" } },
      });
      if (!stored) {
        return NextResponse.json({ error: "No OTP found. Please request a new OTP." }, { status: 400 });
      }
      if (new Date() > stored.expiresAt) {
        await prisma.otp.delete({ where: { email_purpose: { email, purpose: "register" } } }).catch(() => {});
        return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
      }
      if (stored.code !== otpCode.trim()) {
        return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
      }
      await prisma.otp.delete({ where: { email_purpose: { email, purpose: "register" } } }).catch(() => {});
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email: email || `${username}@temp.local`,
        phone: phone || undefined,
        password: hashedPassword,
        role: "VIEWER",
        status: "ACTIVE",
      },
    });

    // Create default portfolio content
    await prisma.heroContent.create({
      data: {
        userId: user.id,
        name: name,
        greeting: "Hello, World! I'm",
        roles: ["Developer", "Designer", "Creator"],
        description: "Welcome to my portfolio!",
      },
    });

    await prisma.aboutContent.create({
      data: {
        userId: user.id,
        bio1: "Add your bio here",
        bio2: "Tell us more about yourself",
        email: email || identifier,
      },
    });

    await prisma.siteSettings.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully",
      username: user.username 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
