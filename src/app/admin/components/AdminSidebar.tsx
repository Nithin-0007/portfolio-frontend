"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import styles from "./AdminSidebar.module.css";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin", icon: "⬡", label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content",      icon: "◉", label: "Profile & Resume" },
      { href: "/admin/projects",     icon: "◈", label: "Projects" },
      { href: "/admin/skills",       icon: "◎", label: "Skills" },
      { href: "/admin/experience",   icon: "◷", label: "Experience" },
      { href: "/admin/achievements", icon: "◆", label: "Achievements" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/admin/events",        icon: "◉", label: "Events" },
      { href: "/admin/messages",      icon: "◈", label: "Messages" },
      { href: "/admin/notifications", icon: "◎", label: "Notifications" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users",         icon: "◈", label: "Users", adminOnly: true },
      { href: "/admin/settings/site", icon: "◎", label: "Site Settings" },
    ],
  },
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

  const userRole = session?.user?.role as string;
  const isAdmin = userRole === "ADMIN";
  const username = (session?.user as any)?.username || "";
  const roleLabel = isAdmin ? "Admin" : "Portfolio Owner";

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>

      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>P</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoLabel}>PortfolioOS</span>
            <span className={styles.logoSub}>Admin Console</span>
          </div>
        )}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav Groups */}
      <nav className={styles.nav}>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !(item as any).adminOnly || isAdmin
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className={styles.navGroup}>
              {!collapsed && (
                <div className={styles.navGroupLabel}>{group.label}</div>
              )}
              {visibleItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href, (item as any).exact) ? styles.active : ""}`}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {!collapsed && <span className={styles.label}>{item.label}</span>}
                </a>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <a href={`/${username}`} target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
          <span className={styles.icon}>↗</span>
          {!collapsed && <span>View Portfolio</span>}
        </a>
        <div className={styles.userRow}>
          <div className={styles.avatar}>
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{session?.user?.name}</span>
              <span className={styles.userRole}>{roleLabel}</span>
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
