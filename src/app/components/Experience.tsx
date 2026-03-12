"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Experience.module.css";

export default function Experience({ data, achievements }: { data: any[]; achievements: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const initialExperiences = [
    { role: "Senior Full-Stack Developer", company: "TechCorp Solutions", period: "2024 – Present", type: "EXPERIENCE", icon: "🏢", color: "#7c3aed", points: ["Led development of a multi-tenant SaaS platform serving 10,000+ users", "Architected microservices with Node.js, reducing API response time by 40%", "Built AI-powered features using LangChain and OpenAI APIs", "Mentored 4 junior developers and conducted weekly code reviews"] },
    { role: "Frontend Developer", company: "Innovate Labs", period: "2022 – 2024", type: "EXPERIENCE", icon: "⚡", color: "#06b6d4", points: ["Developed 15+ responsive React applications with pixel-perfect UI", "Improved Core Web Vitals scores by 35% through performance optimization", "Integrated 20+ third-party APIs and payment gateways (Stripe, Razorpay)", "Collaborated closely with designers to implement complex animations"] },
    { role: "Full-Stack Developer Intern", company: "StartupHub", period: "2022 – 2022", type: "EXPERIENCE", icon: "🚀", color: "#f59e0b", points: ["Built a real-time analytics dashboard using React and WebSockets", "Designed and implemented REST APIs with Node.js and MongoDB", "Contributed to open-source projects, gaining 200+ GitHub stars"] },
  ];

  const initialEducation = [
    { degree: "B.Tech in Computer Science", school: "Anna University", period: "2019 – 2023", grade: "CGPA: 8.7 / 10", icon: "🎓", color: "#22c55e", type: "EDUCATION" },
    { degree: "Full-Stack Web Development", school: "The Odin Project + freeCodeCamp", period: "2021 – 2022", grade: "Certifications Earned", icon: "📜", color: "#7c3aed", type: "EDUCATION" },
  ];

  const initialAchievements = [
    { title: "200+ GitHub stars earned" },
    { title: "Top 10% on LeetCode" },
    { title: "Hackathon Winner 2023" },
    { title: "AWS Certified Developer" },
  ];

  let displayExperiences = data?.length ? data.filter((e: any) => e.type === "EXPERIENCE") : initialExperiences;
  let displayEducation = data?.length ? data.filter((e: any) => e.type === "EDUCATION").map((e: any) => ({
    degree: e.role,
    school: e.company,
    period: e.period,
    grade: e.points?.[0] || "",
    icon: e.icon,
    color: e.color
  })) : initialEducation;
  let displayAchievements = achievements?.length ? achievements : initialAchievements;


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 120);
          });
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" className={`section ${styles.experience}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-cyan ${styles.bgGlow}`} />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">
            <span>📅</span> Career Timeline
          </div>
          <h2 className="section-title reveal">
            Work <span className="gradient-text">Experience</span>
          </h2>
          <p className="section-subtitle reveal" style={{ margin: "0 auto" }}>
            My professional journey building products people love.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Timeline */}
          <div className={styles.timeline}>
            <div className={styles.timelineLine} />
            {displayExperiences.map((exp, i) => (
              <div key={`${exp.role}-${exp.company}-${i}`} className={`${styles.timelineItem} reveal`} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className={styles.timelineDot} style={{ background: exp.color || "#7c3aed", boxShadow: `0 0 20px ${exp.color || "#7c3aed"}88` }}>
                  {exp.icon || "🏢"}
                </div>
                <div className={`glass-card ${styles.card}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.role}>{exp.role}</h3>
                      <span className={styles.company} style={{ color: exp.color || "#7c3aed" }}>{exp.company}</span>
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.period}>{exp.period}</span>
                      <span className={styles.typeBadge}>{exp.type}</span>
                    </div>
                  </div>
                  <ul className={styles.points}>
                    {exp.points?.map((p: string, j: number) => (
                      <li key={`${p}-${j}`} className={styles.point}>
                        <span className={styles.bullet} style={{ background: exp.color || "#7c3aed" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Education Sidebar */}
          <div className={styles.sidebar}>
            <h3 className={`${styles.sidebarTitle} reveal`}>Education</h3>
            {displayEducation.map((edu, i) => (
              <div key={`${edu.degree}-${i}`} className={`glass-card ${styles.eduCard} reveal`} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className={styles.eduIcon} style={{ background: `${edu.color || "#7c3aed"}22`, border: `1px solid ${edu.color || "#7c3aed"}44` }}>
                  {edu.icon || "🎓"}
                </div>
                <div className={styles.eduContent}>
                  <h4 className={styles.degree}>{edu.degree}</h4>
                  <span className={styles.school} style={{ color: edu.color || "#7c3aed" }}>{edu.school}</span>
                  <div className={styles.eduMeta}>
                    <span className={styles.period} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {edu.period}
                    </span>
                    {edu.grade && <span className={styles.grade}>{edu.grade}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Achievements */}
            <div className={`glass-card ${styles.achieveCard} reveal`}>
              <h3 className={styles.sidebarTitle} style={{ margin: 0, marginBottom: 16 }}>🏆 Achievements</h3>
              {displayAchievements.map((a, i) => (
                <div key={`${a.title}-${i}`} className={styles.achieve}>
                  <span className={styles.achieveDot} />
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
