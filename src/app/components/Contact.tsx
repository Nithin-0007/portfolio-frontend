"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Contact.module.css";
import { graphqlClient } from "@/lib/graphql-client";

export default function Contact({ data, siteSettings, userId }: { data: any; siteSettings?: any; userId?: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sectionRef = useRef<HTMLDivElement>(null);

  const infoItems = [
    { icon: "📍", label: "Location", value: siteSettings?.contactLocation || data?.location || "Chennai, Tamil Nadu, India" },
    { icon: "📧", label: "Email", value: siteSettings?.contactEmail || data?.email || "admin@nithish.dev" },
    { icon: "📱", label: "Phone", value: siteSettings?.contactPhone || data?.phone || "+91 98765 43210" },
    { icon: "🕐", label: "Availability", value: siteSettings?.contactAvailability || data?.availability || "Open to opportunities" },
  ];

  const contactSubtitle = siteSettings?.contactSubtitle || "Whether you need a full-stack web application, an AI integration, or a technical consultation, my inbox is always open. Let\u2019s create something impactful.";

  const dynamicSocials = [];
  if (data?.github) dynamicSocials.push({ label: "GitHub", href: data.github, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>, color: "#e2e8f0" });
  if (data?.linkedin) dynamicSocials.push({ label: "LinkedIn", href: data.linkedin, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, color: "#0077b5" });
  if (data?.twitter) dynamicSocials.push({ label: "Twitter / X", href: data.twitter, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color: "#1da1f2" });
  dynamicSocials.push({ label: "Email", href: `mailto:${data?.email || "nithish@example.com"}`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, color: "#ec4899" });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".reveal").forEach((el, i) => {
            setTimeout(() => el.classList.add("visible"), i * 100);
          });
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const mutation = `
        mutation SendMessage($name: String!, $email: String!, $subject: String!, $message: String!, $targetUsername: String!) {
          sendMessage(name: $name, email: $email, subject: $subject, message: $message, targetUsername: $targetUsername) {
            id
          }
        }
      `;
      
      const pathParts = window.location.pathname.split('/');
      const targetUsername = pathParts[pathParts.length - 1] || "admin";

      const data = await graphqlClient.query(mutation, { 
        ...form, 
        targetUsername 
      });

      if (data?.sendMessage) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("error");
    }
  };


  return (
    <section id="contact" className={`section ${styles.contact}`} ref={sectionRef}>
      <div className={`bg-glow bg-glow-pink ${styles.bgGlow1}`} />
      <div className={`bg-glow bg-glow-purple ${styles.bgGlow2}`} />
      <div className="container">
        <div className="section-header">
          <div className="section-tag reveal">
            <span>📬</span> Get In Touch
          </div>
          <h2 className="section-title reveal">
            Let&apos;s <span className="gradient-text">Work Together</span>
          </h2>
          <p className="section-subtitle reveal" style={{ margin: "0 auto" }}>
            Ready to elevate your digital presence? I&apos;m currently accepting new projects and full-time opportunities.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Info Side */}
          <div className={`${styles.infoCol} reveal`}>
            <div className={`glass-card ${styles.infoCard}`}>
              <div className={styles.infoCardBg} />
              <h3 className={styles.infoTitle}>Contact Information</h3>
              <p className={styles.infoSubtitle}>
                {contactSubtitle}
              </p>
              <div className={styles.infoList}>
                {infoItems.map((item) => (
                  <div key={item.label} className={styles.infoItem}>
                    <span className={styles.infoIcon}>{item.icon}</span>
                    <div>
                      <div className={styles.infoLabel}>{item.label}</div>
                      <div className={styles.infoValue}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.socialRow}>
                {dynamicSocials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label={s.label}
                    style={{ "--social-color": s.color, "--social-color-rgb": s.color.replace('#', '') } as React.CSSProperties}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className={`${styles.formCol} reveal`} style={{ transitionDelay: "0.1s" }}>
            <div className={`glass-card ${styles.formCard}`}>
              {status === "sent" ? (
                <div className={styles.successMsg}>
                  <div className={styles.successIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3>Transmission Successful!</h3>
                  <p>Your message has been securely delivered to my inbox. I&apos;ll review your requirements and get back to you within 24 hours.</p>
                  <button className="btn btn-primary" onClick={() => setStatus("idle")} style={{ marginTop: 12 }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <input
                        className={styles.input}
                        type="text"
                        name="name"
                        id="contact-name"
                        placeholder=" "
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="contact-name" className={styles.label}>Full Name</label>
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        className={styles.input}
                        type="email"
                        name="email"
                        id="contact-email"
                        placeholder=" "
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="contact-email" className={styles.label}>Corporate Email</label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      className={styles.input}
                      type="text"
                      name="subject"
                      id="contact-subject"
                      placeholder=" "
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="contact-subject" className={styles.label}>Subject / Project Inquiry</label>
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      name="message"
                      id="contact-message"
                      placeholder=" "
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="contact-message" className={styles.label}>Project Details & Requirements</label>
                  </div>
                  <div className={styles.submitGroup}>
                    <button
                      type="submit"
                      className={`${styles.submitBtn} ${status === "sending" ? styles.sendingState : ""}`}
                      disabled={status === "sending"}
                      id="contact-submit"
                    >
                      {status === "sending" ? (
                        <>
                          <div className={styles.spinner} />
                          Processing...
                        </>
                      ) : (
                        <>
                          Initiate Contact
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
