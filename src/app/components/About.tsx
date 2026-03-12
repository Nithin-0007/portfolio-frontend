"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";

export default function About({ data }: { data: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const aboutHighlights = data?.highlights || ["Problem Solver", "Clean Code Advocate", "Team Player", "Lifelong Learner"];
  const aboutBio1 = data?.bio1 || "Hey! I'm Nithish Kumar — a passionate full-stack developer with a love for building products that are both technically robust and beautifully designed.";
  const aboutBio2 = data?.bio2 || "I specialize in the JavaScript ecosystem — React, Next.js, Node.js — and I'm always exploring new technologies like AI integrations, serverless architectures, and edge computing.";
  const aboutAvailability = data?.availability || "Available for hire";

  const stats = [
    { value: 25, suffix: "+", label: "Projects Shipped" },
    { value: 3, suffix: "+", label: "Years Experience" },
    { value: 15, suffix: "+", label: "Technologies" },
    { value: 100, suffix: "%", label: "Client Satisfaction" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={`section ${styles.about}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-purple ${styles.bgGlow}`} />
      <div className="container">
        <div className={styles.grid}>
          {/* Image / Visual Side */}
          <div className={`${styles.imageCol} reveal`}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageBorder} />
              <div className={styles.imageInner}>
                <div className={styles.avatar}>
                  {data?.profileImage ? (
                    <img src={data.profileImage} alt="Profile" className={styles.profileImg} />
                  ) : (
                    <span>{data?.name?.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase() || "NR"}</span>
                  )}
                </div>
                <div className={styles.codeSnippet}>
                  <pre className={styles.codeText}>
                    {`const developer = {
  name: "${data?.name || 'The Developer'}",
  role: "${data?.snippetRole || 'Full-Stack Dev'}",
  passion: "${data?.snippetPassion || 'Building'}",
  coffee: ${data?.snippetCoffee || 'Infinity'}
};`}
                  </pre>
                </div>
              </div>
              {/* Experience badge */}
              <div className={styles.expBadge}>
                <span className={styles.expNum}>{data?.experienceTitle?.split(" ")[0] || "3+"}</span>
                <span className={styles.expLabel}>{data?.experienceTitle?.split(" ").slice(1).join(" ") || "Years Exp."}</span>
              </div>
              {/* Available badge */}
              <div className={styles.availBadge}>
                <span className={styles.availDot} />
                {aboutAvailability}
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className={styles.textCol}>
            <div className={`section-tag reveal`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.86 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" /></svg>
              About Me
            </div>
            <h2 className={`section-title reveal`}>
              Crafting Digital<br /><span className="gradient-text">Experiences</span>
            </h2>
            <p className={`${styles.bio} reveal`}>
              {aboutBio1}
            </p>
            <p className={`${styles.bio} reveal`}>
              {aboutBio2}
            </p>

            <div className={`${styles.highlights} reveal`}>
              {aboutHighlights.map((h: string, i: number) => (
                <span key={`${h}-${i}`} className={`tech-tag ${styles.highlight}`}>
                  ✦ {h}
                </span>
              ))}
            </div>

            <div className={`${styles.actions} reveal`}>
              <a
                href={data?.cvUrl || "/resume.pdf"}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download CV
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </a>
              <a
                href="#contact"
                className="btn btn-outline"
                onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                Let&apos;s Talk
              </a>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={`${stat.label}-${i}`} className={`glass-card ${styles.statCard} reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className={`gradient-text ${styles.statValue}`}>
                {stat.value}{stat.suffix}
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
