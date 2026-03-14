import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, name, identifier, password } = await req.json();

    // Validate input
    if (!username || !name || !identifier || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Determine if identifier is email or phone
    const isEmail = identifier.includes("@");
    const email = isEmail ? identifier : "";
    const phone = !isEmail ? identifier : "";

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
