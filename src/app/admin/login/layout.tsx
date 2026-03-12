import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel – NR Portfolio",
  description: "Portfolio Admin Dashboard",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
