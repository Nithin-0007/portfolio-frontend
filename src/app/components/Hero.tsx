"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

export default function Hero({ data, stats: propStats, skills }: { data: any; stats: any; skills?: any[] }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heroRoles = data?.roles || [];
  const heroName = data?.name || "";
  const heroGreeting = data?.greeting || "Hello, I'm";
  const heroDescription = data?.description || "";

  const stats = propStats || [];

  useEffect(() => {
    const current = heroRoles[roleIndex];
    if (!current) return;
    
    if (!deleting && displayed.length < current.length) {
      timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setRoleIndex((i) => (i + 1) % heroRoles.length);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayed, deleting, roleIndex, heroRoles]);

  return (
    <section id="home" className={styles.hero}>
      {/* Background layers */}
      <div className={styles.bgMesh} />
      <div className={styles.gridBg} />
      <div className={`bg-glow bg-glow-purple ${styles.glow1}`} />
      <div className={`bg-glow bg-glow-cyan ${styles.glow2}`} />
      <div className={`bg-glow bg-glow-pink ${styles.glow3}`} />

      {/* Animated rings */}
      <div className={styles.ringWrapper} aria-hidden="true">
        <div className={styles.ring1} />
        <div className={styles.ring2} />
        <div className={styles.ring3} />
      </div>

      {/* Dynamic floating skill badges */}
      {skills && skills.slice(0, 5).map((skill, i) => (
        <div
          key={skill.id || skill.label}
          className={`floating-badge ${styles[`badge${i + 1}` as keyof typeof styles]}`}
          aria-hidden="true"
        >
          {skill.icon || "⚡"} {skill.label}
        </div>
      ))}

      {/* Content */}
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.greeting}>
          <span className={styles.greetingDot} />
          👋 {heroGreeting}
        </div>

        <h1 className={styles.name}>
          <span className="gradient-text-hero">{heroName}</span>
        </h1>

        <div className={styles.roleWrapper}>
          <span className={styles.roleStatic}>A&nbsp;</span>
          <span className={styles.roleTyped}>{displayed}</span>
          <span className={styles.cursor} />
        </div>

        <p className={styles.description}>
          {heroDescription}
        </p>

        <div className={styles.ctaRow}>
          <a href="#projects" className="btn btn-primary" onClick={(e) => { e.preventDefault(); document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" }); }}>
            View My Work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#contact" className="btn btn-outline" onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}>
            Get In Touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
        </div>

        <div className={styles.statsRow}>
          {stats.map((stat: any, index: number) => (
            <div key={`${stat.label}-${index}`} className={styles.statItem}>
              <span className={`gradient-text ${styles.statValue}`}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.mouse}>
          <div className={styles.mouseWheel} />
        </div>
        <span>Scroll Down</span>
      </div>
    </section>
  );
}
