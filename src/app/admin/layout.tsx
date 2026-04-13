import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import RoleChangeWatcher from "@/app/admin/components/RoleChangeWatcher";
import "../globals.css";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin Panel – PortfolioOS",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoleChangeWatcher />
      <div className={styles.adminShell}>
        <AdminSidebar />
        <main className={styles.adminMain}>
          <div className={styles.adminContent}>
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
