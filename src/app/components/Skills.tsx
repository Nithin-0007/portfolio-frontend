"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Skills.module.css";

export default function Skills({ data }: { data: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  const initialCategories = [
    { icon: "⚛️", title: "Frontend", color: "#7c3aed", skills: ["React", "Next.js", "TypeScript", "CSS/SCSS", "Tailwind", "Framer Motion"] },
    { icon: "🔧", title: "Backend", color: "#06b6d4", skills: ["Node.js", "Express", "FastAPI", "Python", "REST APIs", "GraphQL"] },
    { icon: "🗄️", title: "Database", color: "#f59e0b", skills: ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Supabase", "Firebase"] },
    { icon: "☁️", title: "DevOps & Cloud", color: "#ec4899", skills: ["Docker", "AWS", "Vercel", "GitHub Actions", "Linux", "Nginx"] },
    { icon: "🤖", title: "AI / ML", color: "#22c55e", skills: ["LangChain", "OpenAI API", "Ollama", "Hugging Face", "Pinecone", "RAG"] },
    { icon: "🛠️", title: "Tools", color: "#f97316", skills: ["Git/GitHub", "VS Code", "Figma", "Postman", "Jira", "Notion"] },
  ];

  const initialProficiencies = [
    { label: "React / Next.js", value: 92 },
    { label: "TypeScript / JavaScript", value: 90 },
    { label: "Node.js / Express", value: 85 },
    { label: "Python / FastAPI", value: 78 },
    { label: "Database Design", value: 82 },
    { label: "UI/UX Design", value: 75 },
    { label: "DevOps / Cloud", value: 70 },
    { label: "AI Integrations", value: 80 },
  ];

  let displayCategories = initialCategories;
  let displayProficiencies = initialProficiencies;

  if (Array.isArray(data) && data.length > 0) {
    displayProficiencies = data.map((s: any) => ({ label: s.label, value: s.value }));
    
    // Group skills by category
    const grouped = data.reduce((acc: any, s: any) => {
      const cat = s.category || "Other";
      if (!acc[cat]) acc[cat] = { title: cat, icon: s.icon || "🛠️", color: "#7c3aed", skills: [] };
      acc[cat].skills.push(s.label);
      return acc;
    }, {});
    
    displayCategories = Object.values(grouped);
  }


  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll<HTMLElement>("[data-width]").forEach((bar) => {
              bar.style.width = bar.dataset.width + "%";
            });
            barObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) revealObserver.observe(sectionRef.current);
    if (barsRef.current) barObserver.observe(barsRef.current);

    return () => { revealObserver.disconnect(); barObserver.disconnect(); };
  }, []);

  return (
    <section id="skills" className={`section ${styles.skills}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-cyan ${styles.bgGlow}`} />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">
            <span>🛠️</span> Skills & Expertise
          </div>
          <h2 className="section-title reveal">
            My <span className="gradient-text">Tech Stack</span>
          </h2>
          <p className="section-subtitle reveal" style={{ margin: "0 auto" }}>
            A curated toolkit I use to build fast, scalable, and beautiful products from idea to deployment.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left: Categories */}
          <div className={styles.categories}>
            {displayCategories.map((cat, i) => (
              <div
                key={`${cat.title}-${i}`}
                className={`glass-card ${styles.catCard} reveal`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className={styles.catHeader}>
                  <span className={styles.catIcon} style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}>
                    {cat.icon}
                  </span>
                  <span className={styles.catTitle} style={{ color: cat.color }}>
                    {cat.title}
                  </span>
                </div>
                <div className={styles.catSkills}>
                  {cat.skills.map((s: string, j: number) => (
                    <span key={`${s}-${j}`} className={`tech-tag ${styles.skillChip}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Proficiency bars */}
          <div className={`${styles.bars} reveal`} ref={barsRef}>
            <h3 className={styles.barsTitle}>Proficiency Levels</h3>
            {displayProficiencies.map((p, i) => (
              <div key={`${p.label}-${i}`} className={styles.barItem}>
                <div className={styles.barMeta}>
                  <span className={styles.barLabel}>{p.label}</span>
                  <span className={styles.barValue}>{p.value}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    data-width={p.value}
                    style={{ width: "0%", "--bar-color": p.value >= 85 ? "var(--accent-primary)" : p.value >= 75 ? "var(--accent-secondary)" : "var(--accent-tertiary)" } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
