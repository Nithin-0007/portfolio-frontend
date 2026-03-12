"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import styles from "./AdminSidebar.module.css";

const navItems = [
  { href: "/admin", icon: "📊", label: "Dashboard", exact: true },
  { href: "/admin/content", icon: "👤", label: "Profile & Resume" },
  { href: "/admin/projects", icon: "💼", label: "Projects" },
  { href: "/admin/skills", icon: "🛠️", label: "Skills" },
  { href: "/admin/experience", icon: "📅", label: "Experience" },
  { href: "/admin/achievements", icon: "🏆", label: "Achievements" },
  { href: "/admin/events", icon: "🎯", label: "Events" },
  { href: "/admin/notifications", icon: "🔔", label: "Notifications" },
  { href: "/admin/messages", icon: "📬", label: "Messages" },
  { href: "/admin/users", icon: "👥", label: "Users" },
  { href: "/admin/settings/site", icon: "⚙️", label: "Site Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoMark}>NR</span>
        {!collapsed && <span className={styles.logoLabel}>Admin Panel</span>}
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href, item.exact) ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
          </a>
        ))}
      </nav>

      {/* User Footer */}
      <div className={styles.footer}>
        <a href={`/${(session?.user as any)?.username || ""}`} target="_blank" className={styles.viewSite}>
          <span>🌐</span>
          {!collapsed && "View Site"}
        </a>
        <div className={styles.userRow}>
          <div className={styles.avatar}>
            {session?.user?.name?.[0] || "A"}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{session?.user?.name}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          )}
          <button className={styles.signOutBtn} onClick={handleSignOut} title="Sign Out">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
