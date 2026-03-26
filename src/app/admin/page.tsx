"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./admin-pages.module.css";
import { graphqlClient } from "@/lib/graphql-client";

/* ── Portfolio Link Banner ─────────────────────────────────────────────────── */
function PortfolioLinkBanner({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const portfolioUrl = `${baseUrl}/${username}`;

  if (!username) return null;

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "rgba(124,58,237,0.06)",
      border: "1px solid rgba(124,58,237,0.18)",
      borderRadius: "18px", padding: "20px 24px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
    }}>
      {/* gradient top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.4), transparent)",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
          border: "1px solid rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
        }}>↗</div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#3a5068", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3, fontWeight: 600 }}>
            Live Portfolio URL
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#c4b5fd", fontFamily: "monospace" }}>
            {portfolioUrl}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#2d4156", marginTop: 2 }}>
            Share on LinkedIn, GitHub &amp; your resume
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() => { navigator.clipboard.writeText(portfolioUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{
            padding: "8px 16px", borderRadius: "9px", cursor: "pointer", fontWeight: 600,
            fontSize: "0.82rem", transition: "all 0.2s", border: "1px solid",
            background: copied ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
            borderColor: copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)",
            color: copied ? "#4ade80" : "#8098b2",
          }}
        >{copied ? "✓ Copied" : "Copy URL"}</button>
        <a href={`/${username}`} target="_blank" rel="noopener noreferrer" style={{
          padding: "8px 16px", borderRadius: "9px", fontWeight: 600,
          fontSize: "0.82rem", textDecoration: "none", display: "inline-flex",
          alignItems: "center", gap: 5,
          background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
          color: "#67e8f9",
        }}>View Live ↗</a>
      </div>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, href, color, bg }: any) {
  return (
    <a href={href} className={styles.statCard} style={{ borderColor: `${color}22` }}>
      <div className={styles.statIcon} style={{ background: bg, border: `1px solid ${color}28` }}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue} style={{ color }}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </a>
  );
}

/* ── Quick Action Card ──────────────────────────────────────────────────────── */
function QuickCard({ href, icon, label, desc }: { href: string; icon: string; label: string; desc?: string }) {
  return (
    <a href={href} style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      padding: "16px 18px", borderRadius: "14px",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.055)",
      textDecoration: "none",
      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(124,58,237,0.07)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(124,58,237,0.22)";
      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.025)";
      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.055)";
      (e.currentTarget as HTMLAnchorElement).style.transform = "none";
    }}>
      <span style={{ fontSize: "1.2rem", lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#c5d5e5" }}>{label}</div>
        {desc && <div style={{ fontSize: "0.75rem", color: "#3a5068", marginTop: 2 }}>{desc}</div>}
      </div>
    </a>
  );
}

/* ── GraphQL ────────────────────────────────────────────────────────────────── */
const GET_COUNTS = `
  query GetCounts($username: String!) {
    getProjects(username: $username, admin: true, limit: 1)  { pageInfo { total } }
    getExperiences(username: $username, limit: 1)            { pageInfo { total } }
    getSkills(username: $username, limit: 1)                 { pageInfo { total } }
    getEvents(username: $username, limit: 1)                 { pageInfo { total } }
    getMessages(username: $username, limit: 1)               { pageInfo { total } }
    getNotifications(username: $username, limit: 1)          { pageInfo { total } }
    getAchievements(username: $username, limit: 1)           { pageInfo { total } }
  }
`;

/* ── Dashboard ──────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || "";
  const name = session?.user?.name?.split(" ")[0] || "there";

  const [counts, setCounts] = useState({
    projects: "—", experiences: "—", skills: "—",
    events: "—", messages: "—", notifications: "—", achievements: "—",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    if (!username) return;
    graphqlClient.query(GET_COUNTS, { username }).then((data) => {
      setCounts({
        projects:      data?.getProjects?.pageInfo?.total      ?? "—",
        experiences:   data?.getExperiences?.pageInfo?.total   ?? "—",
        skills:        data?.getSkills?.pageInfo?.total        ?? "—",
        events:        data?.getEvents?.pageInfo?.total        ?? "—",
        messages:      data?.getMessages?.pageInfo?.total      ?? "—",
        notifications: data?.getNotifications?.pageInfo?.total ?? "—",
        achievements:  data?.getAchievements?.pageInfo?.total  ?? "—",
      });
    }).catch(() => {});
  }, [username]);

  const stats = [
    { icon: "◈", label: "Projects",      value: counts.projects,      href: "/admin/projects",     color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
    { icon: "◷", label: "Experience",    value: counts.experiences,   href: "/admin/experience",   color: "#67e8f9", bg: "rgba(6,182,212,0.1)"   },
    { icon: "◎", label: "Skills",        value: counts.skills,        href: "/admin/skills",       color: "#6ee7b7", bg: "rgba(16,185,129,0.1)"  },
    { icon: "◉", label: "Events",        value: counts.events,        href: "/admin/events",       color: "#fda4af", bg: "rgba(244,63,94,0.1)"   },
    { icon: "◈", label: "Messages",      value: counts.messages,      href: "/admin/messages",     color: "#fbbf24", bg: "rgba(245,158,11,0.1)"  },
    { icon: "◆", label: "Achievements",  value: counts.achievements,  href: "/admin/achievements", color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
  ];

  const quickActions = [
    { href: "/admin/projects",     icon: "◈", label: "Add Project",       desc: "Showcase new work" },
    { href: "/admin/content",      icon: "◉", label: "Edit Profile",       desc: "Update bio & photo" },
    { href: "/admin/experience",   icon: "◷", label: "Add Experience",     desc: "Work & education" },
    { href: "/admin/skills",       icon: "◎", label: "Update Skills",      desc: "Tech stack & levels" },
    { href: "/admin/events",       icon: "◉", label: "Create Event",       desc: "Talks, workshops" },
    { href: "/admin/messages",     icon: "◈", label: "Read Messages",      desc: `${counts.messages} waiting` },
    { href: "/admin/settings/site",icon: "◎", label: "Site Settings",      desc: "Footer, links, stats" },
    { href: `/${username}`,        icon: "↗", label: "View Portfolio",     desc: "See the live site" },
  ];

  return (
    <div className={styles.page}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#3a5068", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>
            {today}
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#f0f4f8", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {greeting}, {name} 👋
          </h1>
          <p style={{ color: "#3a5068", marginTop: 6, fontSize: "0.88rem" }}>
            Your portfolio is live and looking great.
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: "100px",
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)",
          fontSize: "0.75rem", fontWeight: 600, color: "#4ade80",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
          All systems online
        </div>
      </div>

      {/* Portfolio URL */}
      <PortfolioLinkBanner username={username} />

      {/* Stats */}
      <div>
        <div className={styles.sectionTitle}>Portfolio Stats</div>
        <div className={styles.statsGrid}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className={styles.sectionTitle}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {quickActions.map((q) => <QuickCard key={q.label} {...q} />)}
        </div>
      </div>

    </div>
  );
}
