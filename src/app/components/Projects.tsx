"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Projects.module.css";

export default function Projects({ data }: { data: any[] }) {
  const [active, setActive] = useState("All");
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const initialProjects = [
    { title: "AI Chat Platform", description: "A full-stack chat application powered by Ollama local LLMs. Features real-time streaming, conversation history, multi-model support, and a beautiful dark UI.", tags: ["Next.js", "Ollama", "TypeScript", "WebSockets", "PostgreSQL"], category: "AI/ML", icon: "🤖", color: "#7c3aed", github: "https://github.com", live: "https://github.com", featured: true },
    { title: "E-Commerce Dashboard", description: "A modern admin dashboard for managing products, orders, and analytics with real-time charts, advanced filtering, and role-based access control.", tags: ["React", "Node.js", "MongoDB", "Chart.js", "JWT"], category: "Full-Stack", icon: "📊", color: "#06b6d4", github: "https://github.com", live: "https://github.com", featured: true },
    { title: "SaaS Landing Builder", description: "A drag-and-drop landing page builder for SaaS products with component library, custom themes, one-click deploy, and analytics integration.", tags: ["Next.js", "TypeScript", "Supabase", "Stripe", "Vercel"], category: "Web App", icon: "🎨", color: "#ec4899", github: "https://github.com", live: "https://github.com" },
    { title: "DevDocs RAG Engine", description: "Retrieval-Augmented Generation system that indexes your documentation and answers developer questions with cited sources using embeddings and vector search.", tags: ["Python", "LangChain", "Pinecone", "FastAPI", "OpenAI"], category: "AI/ML", icon: "📚", color: "#22c55e", github: "https://github.com", live: "https://github.com" },
    { title: "Real-Time Collab App", description: "Google Docs–like collaborative text editor with operational transforms, real-time cursors, comments, version history, and offline support.", tags: ["React", "Socket.io", "Node.js", "Redis", "OT"], category: "Full-Stack", icon: "✏️", color: "#f59e0b", github: "https://github.com", live: "https://github.com" },
    { title: "CLI Dev Toolkit", description: "A powerful CLI tool for scaffolding projects, managing environment configs, running parallel scripts, and automating repetitive developer workflows.", tags: ["Node.js", "TypeScript", "Commander.js", "Inquirer"], category: "Tool", icon: "⚡", color: "#f97316", github: "https://github.com", live: "https://github.com" },
  ];

  const displayProjects = data && data.length > 0 ? data : initialProjects;
  const categories = ["All", ...Array.from(new Set(displayProjects.map((p) => p.category)))];
  const filtered = active === "All" ? displayProjects : displayProjects.filter((p) => p.category === active);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          entry.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 80);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className={`section ${styles.projects}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-purple ${styles.bgGlow}`} />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">
            <span>💼</span> Portfolio
          </div>
          <h2 className="section-title reveal">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="section-subtitle reveal" style={{ margin: "0 auto" }}>
            A selection of projects I&apos;ve built — ranging from AI-powered tools to full-stack web apps.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`${styles.filters} reveal`}>
          {categories.map((f, i) => (
            <button
              key={`${f}-${i}`}
              className={`${styles.filterBtn} ${active === f ? styles.filterActive : ""}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className={`${styles.grid} ${visible ? styles.gridVisible : ""}`}>
          {filtered.map((project, i) => (
            <div
              key={`${project.title}-${i}`}
              className={`${styles.card} ${project.featured ? styles.featured : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardIcon} style={{ background: `${project.color || "#7c3aed"}22`, border: `1px solid ${project.color || "#7c3aed"}44` }}>
                  <span>{project.icon || "💻"}</span>
                </div>
                {project.featured && (
                  <span className={styles.featuredBadge}>⭐ Featured</span>
                )}
                <div className={styles.cardLinks}>
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.iconLink} aria-label="GitHub">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.iconLink} aria-label="Live Demo">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                </div>
              </div>

              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.cardDesc}>{project.description}</p>

              <div className={styles.cardTags}>
                {project.tags?.map((t: string, j: number) => (
                  <span key={`${t}-${j}`} className={`tech-tag tech-tag-cyan ${styles.cardTag}`}>{t}</span>
                ))}
              </div>

              <div className={styles.cardGlow} style={{ background: `${project.color || "#7c3aed"}18` }} />
            </div>
          ))}
        </div>

        <div className={`${styles.viewMore} reveal`}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            View All on GitHub
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
