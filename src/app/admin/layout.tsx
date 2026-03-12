import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import "../globals.css";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin Panel – NR Portfolio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
