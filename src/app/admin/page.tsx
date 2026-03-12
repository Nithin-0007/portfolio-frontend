import styles from "./admin-pages.module.css";
import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();
  const username = (session?.user as any)?.username || "";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Welcome back, Admin! Here's your portfolio overview.</p>
      </div>

      <div className={styles.statsGrid}>
        {[
          { icon: "💼", label: "Projects", value: "—", href: "/admin/projects", color: "#7c3aed" },
          { icon: "🎯", label: "Events", value: "—", href: "/admin/events", color: "#06b6d4" },
          { icon: "📬", label: "Messages", value: "—", href: "/admin/messages", color: "#ec4899" },
          { icon: "👥", label: "Users", value: "—", href: "/admin/users", color: "#f59e0b" },
          { icon: "🔔", label: "Notifications", value: "—", href: "/admin/notifications", color: "#22c55e" },
          { icon: "💬", label: "Chat Sessions", value: "—", href: "/admin/users", color: "#f97316" },
        ].map((stat) => (
          <a key={stat.label} href={stat.href} className={styles.statCard} style={{ borderColor: `${stat.color}30` }}>
            <div className={styles.statIcon} style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>
              {stat.icon}
            </div>
            <div>
              <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </a>
        ))}
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickGrid}>
          {[
            { href: "/admin/projects", icon: "➕", label: "Add Project" },
            { href: "/admin/events", icon: "📅", label: "Create Event" },
            { href: "/admin/notifications", icon: "📣", label: "Send Notification" },
            { href: "/admin/content", icon: "✏️", label: "Edit Content" },
            { href: "/admin/messages", icon: "📬", label: "View Messages" },
            { href: "/admin/users", icon: "👤", label: "Manage Users" },
            { href: "/admin/settings", icon: "⚙️", label: "Settings" },
            { href: `/${username}`, icon: "🌐", label: "View Portfolio", target: "_blank" },
          ].map((link) => (
            <a key={link.label} href={link.href} className={styles.quickCard}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
