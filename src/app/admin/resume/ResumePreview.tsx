"use client";
import React from "react";
import { ResumeTemplate } from "./templates";

interface ResumeData {
  user?: { name?: string; email?: string; username?: string };
  hero?: { name?: string; roles?: string[]; description?: string };
  about?: {
    bio1?: string; bio2?: string; profileImage?: string;
    location?: string; email?: string; phone?: string;
    github?: string; linkedin?: string; twitter?: string;
  };
  projects?: Array<{
    id: string; title: string; description?: string;
    tags?: string[]; category?: string; github?: string; live?: string; featured?: boolean;
  }>;
  skills?: Array<{ id: string; label: string; value?: number; category?: string }>;
  experiences?: Array<{
    id: string; role: string; company: string; period: string;
    type: string; points?: string[]; icon?: string; order?: number;
  }>;
  achievements?: Array<{ id: string; title: string }>;
  siteSettings?: { contactLocation?: string; contactEmail?: string; contactPhone?: string };
}

interface Props {
  data: ResumeData;
  template: ResumeTemplate;
  forCapture?: boolean;
}

export default function ResumePreview({ data, template: t, forCapture }: Props) {
  const name = data?.hero?.name || data?.user?.name || "Your Name";
  const roles = data?.hero?.roles || [];
  const bio = [data?.about?.bio1, data?.about?.bio2].filter(Boolean).join(" ");
  const location = data?.about?.location || data?.siteSettings?.contactLocation || "";
  const email = data?.about?.email || data?.siteSettings?.contactEmail || data?.user?.email || "";
  const phone = data?.about?.phone || data?.siteSettings?.contactPhone || "";
  const github = data?.about?.github || "";
  const linkedin = data?.about?.linkedin || "";

  const experiences = (data?.experiences || [])
    .filter(e => e.type === "EXPERIENCE")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const education = (data?.experiences || [])
    .filter(e => e.type === "EDUCATION")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const skillsByCategory: Record<string, typeof data.skills> = {};
  (data?.skills || []).forEach(s => {
    const cat = s.category || "General";
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat]!.push(s);
  });

  const projects = (data?.projects || [])
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 6);

  const achievements = data?.achievements || [];

  // ── Shared sub-components using inline styles ──────────────────────────────

  const SectionTitle = ({ children }: { children: React.ReactNode }) => {
    const base: React.CSSProperties = {
      fontFamily: t.headingFamily,
      fontSize: forCapture ? "11px" : "13px",
      fontWeight: 700,
      color: t.sectionTitle,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      marginBottom: 8,
      marginTop: 18,
      paddingBottom: t.sectionBorderStyle === "bottom-line" ? 4 : 0,
      borderBottom: t.sectionBorderStyle === "bottom-line" ? `2px solid ${t.sectionBorderColor}` : "none",
      borderLeft: t.sectionBorderStyle === "left-bar" ? `4px solid ${t.sectionBorderColor}` : "none",
      paddingLeft: t.sectionBorderStyle === "left-bar" ? 8 : 0,
      borderTop: t.sectionBorderStyle === "top-thick" ? `3px solid ${t.sectionBorderColor}` : "none",
      paddingTop: t.sectionBorderStyle === "top-thick" ? 4 : 0,
      background: t.sectionBorderStyle === "bg-fill" && t.sectionTitleBg ? t.sectionTitleBg : "transparent",
      padding: t.sectionBorderStyle === "bg-fill" ? "4px 8px" : (
        t.sectionBorderStyle === "left-bar" ? "2px 0 2px 8px" : undefined
      ),
      borderRadius: t.sectionBorderStyle === "bg-fill" ? 4 : 0,
    };
    return <div style={base}>{children}</div>;
  };

  const Tag = ({ label }: { label: string }) => (
    <span style={{
      display: "inline-block",
      background: t.tagBg, color: t.tagColor,
      border: `1px solid ${t.tagBorder}`,
      borderRadius: 4, padding: "1px 6px",
      fontSize: forCapture ? "7px" : "9px",
      fontFamily: t.fontFamily,
      marginRight: 4, marginBottom: 3,
    }}>{label}</span>
  );

  const SkillBar = ({ label, value }: { label: string; value?: number }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: forCapture ? "8px" : "10px", color: t.sidebarText || t.textPrimary, fontFamily: t.fontFamily }}>{label}</span>
        {value != null && <span style={{ fontSize: forCapture ? "7px" : "9px", color: t.sidebarMuted || t.textMuted }}>{value}%</span>}
      </div>
      <div style={{ background: t.skillBarTrack, borderRadius: 99, height: 4, overflow: "hidden" }}>
        <div style={{ background: t.skillBarFill, width: `${value ?? 80}%`, height: "100%", borderRadius: 99 }} />
      </div>
    </div>
  );

  const ContactItem = ({ icon, text }: { icon: string; text: string }) => {
    if (!text) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5, fontSize: forCapture ? "8px" : "10px", color: t.sidebarText || t.textSecondary, fontFamily: t.fontFamily, wordBreak: "break-all" }}>
        <span style={{ fontSize: forCapture ? "9px" : "11px" }}>{icon}</span> {text}
      </div>
    );
  };

  const Divider = () => (
    <div style={{ borderTop: `1px solid ${t.dividerColor}`, margin: "8px 0" }} />
  );

  const ExperienceBlock = ({ items, label }: { items: typeof experiences; label: string }) => {
    if (!items.length) return null;
    return (
      <>
        <SectionTitle>{label}</SectionTitle>
        {items.map(exp => (
          <div key={exp.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: forCapture ? "9px" : "11px", color: t.textPrimary, fontFamily: t.headingFamily }}>{exp.role}</div>
                <div style={{ fontSize: forCapture ? "8px" : "10px", color: t.accentDot, fontFamily: t.fontFamily }}>{exp.company}</div>
              </div>
              <div style={{ fontSize: forCapture ? "7px" : "9px", color: t.textMuted, fontFamily: t.fontFamily, whiteSpace: "nowrap", marginLeft: 8 }}>{exp.period}</div>
            </div>
            {(exp.points || []).length > 0 && (
              <ul style={{ margin: "4px 0 0 0", paddingLeft: 14, listStyle: "disc" }}>
                {(exp.points || []).slice(0, 4).map((pt, i) => (
                  <li key={i} style={{ fontSize: forCapture ? "7.5px" : "9.5px", color: t.textSecondary, fontFamily: t.fontFamily, marginBottom: 2 }}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </>
    );
  };

  const ProjectsBlock = () => {
    if (!projects.length) return null;
    return (
      <>
        <SectionTitle>Projects</SectionTitle>
        {projects.map(p => (
          <div key={p.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: forCapture ? "9px" : "11px", color: t.textPrimary, fontFamily: t.headingFamily }}>{p.title}</span>
              {p.featured && <span style={{ fontSize: forCapture ? "6px" : "8px", color: t.accentDot, background: t.tagBg, border: `1px solid ${t.tagBorder}`, padding: "1px 5px", borderRadius: 99, fontFamily: t.fontFamily }}>Featured</span>}
            </div>
            {p.description && <div style={{ fontSize: forCapture ? "7.5px" : "9.5px", color: t.textSecondary, fontFamily: t.fontFamily, marginTop: 2, lineHeight: 1.4 }}>{p.description.slice(0, 120)}{p.description.length > 120 ? "..." : ""}</div>}
            <div style={{ marginTop: 4 }}>{(p.tags || []).slice(0, 5).map(tag => <Tag key={tag} label={tag} />)}</div>
          </div>
        ))}
      </>
    );
  };

  const AchievementsBlock = () => {
    if (!achievements.length) return null;
    return (
      <>
        <SectionTitle>Achievements</SectionTitle>
        {achievements.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
            <span style={{ color: t.accentDot, fontSize: forCapture ? "8px" : "10px" }}>★</span>
            <span style={{ fontSize: forCapture ? "8px" : "10px", color: t.textSecondary, fontFamily: t.fontFamily }}>{a.title}</span>
          </div>
        ))}
      </>
    );
  };

  // ── HEADER ─────────────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{
      background: t.headerBg, color: t.headerText,
      padding: forCapture ? "16px 20px" : "24px 30px",
    }}>
      <div style={{ fontFamily: t.headingFamily, fontSize: forCapture ? "20px" : "28px", fontWeight: 800, letterSpacing: "-0.02em", color: t.headerText }}>{name}</div>
      {roles.length > 0 && (
        <div style={{ fontSize: forCapture ? "9px" : "13px", color: t.headerSubtext, marginTop: 4, fontFamily: t.fontFamily }}>
          {roles.slice(0, 3).join(" · ")}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
        {email && <span style={{ fontSize: forCapture ? "7.5px" : "10px", color: t.headerSubtext, fontFamily: t.fontFamily }}>✉ {email}</span>}
        {phone && <span style={{ fontSize: forCapture ? "7.5px" : "10px", color: t.headerSubtext, fontFamily: t.fontFamily }}>📞 {phone}</span>}
        {location && <span style={{ fontSize: forCapture ? "7.5px" : "10px", color: t.headerSubtext, fontFamily: t.fontFamily }}>📍 {location}</span>}
        {github && <span style={{ fontSize: forCapture ? "7.5px" : "10px", color: t.headerSubtext, fontFamily: t.fontFamily }}>🐙 {github.replace("https://github.com/", "")}</span>}
        {linkedin && <span style={{ fontSize: forCapture ? "7.5px" : "10px", color: t.headerSubtext, fontFamily: t.fontFamily }}>💼 LinkedIn</span>}
      </div>
    </div>
  );

  // ── SINGLE COLUMN LAYOUT ───────────────────────────────────────────────────
  if (t.layout === "single") {
    return (
      <div style={{ background: t.bodyBg, fontFamily: t.fontFamily, width: "100%", minHeight: "100%" }}>
        <Header />
        <div style={{ padding: forCapture ? "14px 20px" : "20px 30px" }}>
          {bio && (
            <>
              <SectionTitle>Summary</SectionTitle>
              <p style={{ fontSize: forCapture ? "8px" : "10px", color: t.textSecondary, lineHeight: 1.6, margin: "0 0 4px", fontFamily: t.fontFamily }}>{bio}</p>
              <Divider />
            </>
          )}
          <ExperienceBlock items={experiences} label="Experience" />
          {experiences.length > 0 && <Divider />}
          <ExperienceBlock items={education} label="Education" />
          {education.length > 0 && <Divider />}

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <>
              <SectionTitle>Skills</SectionTitle>
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: forCapture ? "7.5px" : "9.5px", color: t.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: t.headingFamily }}>{cat}</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {(skills || []).map(s => <Tag key={s.id} label={s.label} />)}
                  </div>
                </div>
              ))}
              <Divider />
            </>
          )}

          <ProjectsBlock />
          {projects.length > 0 && <Divider />}
          <AchievementsBlock />
        </div>
      </div>
    );
  }

  // ── SIDEBAR LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div style={{ background: t.bodyBg, fontFamily: t.fontFamily, width: "100%", minHeight: "100%" }}>
      <Header />
      <div style={{ display: "flex", minHeight: 400 }}>
        {/* Sidebar */}
        <div style={{ width: "30%", background: t.sidebarBg, padding: forCapture ? "14px 12px" : "20px 16px", flexShrink: 0 }}>
          {/* Contact */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: forCapture ? "8px" : "10px", fontWeight: 700, color: t.sidebarAccent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: t.headingFamily }}>Contact</div>
            <ContactItem icon="✉" text={email} />
            <ContactItem icon="📞" text={phone} />
            <ContactItem icon="📍" text={location} />
            <ContactItem icon="🐙" text={github ? github.replace("https://github.com/", "") : ""} />
            <ContactItem icon="💼" text={linkedin ? "LinkedIn Profile" : ""} />
          </div>

          {/* Skills by category */}
          {Object.keys(skillsByCategory).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: forCapture ? "8px" : "10px", fontWeight: 700, color: t.sidebarAccent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: t.headingFamily }}>Skills</div>
              {Object.entries(skillsByCategory).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: forCapture ? "7px" : "9px", color: t.sidebarMuted, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: t.headingFamily }}>{cat}</div>
                  {(skills || []).map(s => <SkillBar key={s.id} label={s.label} value={s.value} />)}
                </div>
              ))}
            </div>
          )}

          {/* Achievements in sidebar */}
          {achievements.length > 0 && (
            <div>
              <div style={{ fontSize: forCapture ? "8px" : "10px", fontWeight: 700, color: t.sidebarAccent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: t.headingFamily }}>Achievements</div>
              {achievements.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                  <span style={{ color: t.sidebarAccent, fontSize: forCapture ? "7px" : "9px" }}>★</span>
                  <span style={{ fontSize: forCapture ? "7px" : "9px", color: t.sidebarText, fontFamily: t.fontFamily, lineHeight: 1.4 }}>{a.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: forCapture ? "14px 16px" : "20px 22px" }}>
          {bio && (
            <>
              <SectionTitle>Professional Summary</SectionTitle>
              <p style={{ fontSize: forCapture ? "8px" : "10px", color: t.textSecondary, lineHeight: 1.6, margin: "0 0 4px", fontFamily: t.fontFamily }}>{bio}</p>
            </>
          )}
          <ExperienceBlock items={experiences} label="Experience" />
          <ExperienceBlock items={education} label="Education" />
          <ProjectsBlock />
        </div>
      </div>
    </div>
  );
}
