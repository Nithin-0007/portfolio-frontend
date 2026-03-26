import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        otp:       { label: "OTP Code",      type: "text" },
        loginType: { label: "Login Type",    type: "text" }, // "password" | "otp"
      },
      async authorize(credentials) {
        if (!credentials?.identifier) return null;

        const identifier = credentials.identifier as string;
        const loginType  = (credentials.loginType as string) || "password";

        // Find user by email or phone
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }],
          },
        });

        if (!user || user.status !== "ACTIVE") return null;

        if (loginType === "otp") {
          // ── OTP-based login ──────────────────────────────────────────
          const otp = (credentials.otp as string)?.trim();
          if (!otp) return null;

          const stored = await prisma.otp.findUnique({
            where: { email_purpose: { email: user.email, purpose: "login" } },
          });

          if (!stored) return null;
          if (new Date() > stored.expiresAt) {
            await prisma.otp.delete({
              where: { email_purpose: { email: user.email, purpose: "login" } },
            }).catch(() => {});
            return null;
          }
          if (stored.code !== otp) return null;

          // OTP valid — consume it
          await prisma.otp.delete({
            where: { email_purpose: { email: user.email, purpose: "login" } },
          }).catch(() => {});
        } else {
          // ── Password-based login ─────────────────────────────────────
          if (!credentials?.password || !user.password) return null;
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id:       user.id,
          email:    user.email,
          name:     user.name,
          role:     user.role,
          image:    user.avatar,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role     = (user as any).role;
        token.id       = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id   = token.id   as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});

export function isAdmin(role?: string) {
  return role === "ADMIN";
}
