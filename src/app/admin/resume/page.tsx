"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { TEMPLATES, COMPANY_TEMPLATES, COMPANY_INFO, ResumeTemplate } from "./templates";
import ResumePreview from "./ResumePreview";
import styles from "./resume.module.css";

const GET_RESUME_DATA = `
  query GetPortfolio($username: String!) {
    getPortfolio(username: $username) {
      user { name email username }
      hero { name roles description }
      about { bio1 bio2 location email phone github linkedin twitter profileImage }
      projects { id title description tags category github live featured }
      skills { id label value category }
      experiences { id role company period type points icon order }
      achievements { id title }
      siteSettings { contactLocation contactEmail contactPhone }
    }
  }
`;

// Mini thumbnail renderer (pure CSS, no React)
function TemplateThumbnail({ template: t }: { template: ResumeTemplate }) {
  return (
    <div style={{ width: "100%", height: "100%", background: t.bodyBg, display: "flex", flexDirection: "column", overflow: "hidden", fontSize: 0 }}>
      {/* header bar */}
      <div style={{ background: t.headerBg, height: "30%", padding: "4px 5px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: "60%", height: 5, background: t.headerText, borderRadius: 2, opacity: 0.9, marginBottom: 3 }} />
        <div style={{ width: "40%", height: 3, background: t.headerSubtext, borderRadius: 2, opacity: 0.7 }} />
        <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
          {[30, 25, 35].map((w, i) => <div key={i} style={{ width: `${w}%`, height: 2, background: t.headerSubtext, borderRadius: 1, opacity: 0.5 }} />)}
        </div>
      </div>
      {/* body lines */}
      {t.layout === "sidebar" ? (
        <div style={{ display: "flex", flex: 1 }}>
          <div style={{ width: "35%", background: t.sidebarBg, padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
            {[70, 55, 65, 45, 50].map((w, i) => <div key={i} style={{ width: `${w}%`, height: 2, background: t.sidebarText, borderRadius: 1, opacity: 0.35 }} />)}
          </div>
          <div style={{ flex: 1, padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ width: "45%", height: 2, background: t.sectionBorderColor, borderRadius: 1, marginBottom: 2 }} />
            {[90, 75, 85, 60, 80, 70, 65, 78].map((w, i) => <div key={i} style={{ width: `${w}%`, height: 2, background: t.textSecondary, borderRadius: 1, opacity: 0.3 }} />)}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, padding: "3px 5px", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ width: "35%", height: 2, background: t.sectionBorderColor, borderRadius: 1, marginBottom: 2 }} />
          {[90, 75, 85, 60, 80, 70, 50, 85, 65, 78].map((w, i) => <div key={i} style={{ width: `${w}%`, height: 2, background: t.textSecondary, borderRadius: 1, opacity: 0.3 }} />)}
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username;
  const userName = (session?.user as any)?.name || "User";

  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(TEMPLATES[0]);
  const [generating, setGenerating] = useState<"pdf" | "word" | null>(null);
  const [activeTab, setActiveTab] = useState<"style" | "company">("style");
  const captureRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const data = await graphqlClient.query(GET_RESUME_DATA, { username }, { cache: "no-store" });
      setResumeData(data?.getPortfolio || null);
    } catch (e) {
      console.error("Resume data fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── PDF Download ────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!captureRef.current || !resumeData) return;
    setGenerating("pdf");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Make capture div briefly visible for html2canvas
      captureRef.current.style.left = "0";
      captureRef.current.style.top = "0";
      captureRef.current.style.zIndex = "9999";

      await new Promise(r => setTimeout(r, 100)); // allow DOM paint

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: selectedTemplate.bodyBg,
        logging: false,
      });

      captureRef.current.style.left = "-9999px";
      captureRef.current.style.top = "0";
      captureRef.current.style.zIndex = "-1";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let heightLeft = imgH;
      let pos = 0;

      pdf.addImage(imgData, "PNG", 0, pos, pageW, imgH);
      heightLeft -= pageH;

      while (heightLeft > 0) {
        pos -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, pos, pageW, imgH);
        heightLeft -= pageH;
      }

      const safeName = (resumeData?.hero?.name || resumeData?.user?.name || "resume").replace(/\s+/g, "_");
      pdf.save(`${safeName}_resume_${selectedTemplate.id}.pdf`);
    } catch (e) {
      console.error("PDF generation error", e);
      alert("PDF generation failed. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  // ── Word Download ───────────────────────────────────────────────────────────
  const handleDownloadWord = async () => {
    if (!resumeData) return;
    setGenerating("word");
    try {
      const {
        Document, Packer, Paragraph, TextRun, HeadingLevel,
        AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType,
      } = await import("docx");

      const name = resumeData?.hero?.name || resumeData?.user?.name || "Name";
      const roles = (resumeData?.hero?.roles || []).join(" · ");
      const email = resumeData?.about?.email || resumeData?.siteSettings?.contactEmail || resumeData?.user?.email || "";
      const phone = resumeData?.about?.phone || resumeData?.siteSettings?.contactPhone || "";
      const location = resumeData?.about?.location || resumeData?.siteSettings?.contactLocation || "";
      const github = resumeData?.about?.github || "";
      const linkedin = resumeData?.about?.linkedin || "";
      const bio = [resumeData?.about?.bio1, resumeData?.about?.bio2].filter(Boolean).join(" ");

      const experiences = (resumeData?.experiences || []).filter((e: any) => e.type === "EXPERIENCE").sort((a: any, b: any) => a.order - b.order);
      const education = (resumeData?.experiences || []).filter((e: any) => e.type === "EDUCATION").sort((a: any, b: any) => a.order - b.order);
      const projects = (resumeData?.projects || []).sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 8);
      const skills = resumeData?.skills || [];
      const achievements = resumeData?.achievements || [];

      const HR = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "333333" } },
        spacing: { after: 80 },
      });

      const SectionHead = (text: string) => new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "7c3aed" } },
      });

      const bullet = (text: string) => new Paragraph({
        text,
        bullet: { level: 0 },
        spacing: { after: 40 },
        run: { size: 20 },
      });

      const contactLine = [email, phone, location, github ? `GitHub: ${github}` : "", linkedin ? `LinkedIn: ${linkedin}` : ""].filter(Boolean).join("  |  ");

      const sections: any[] = [
        // Name
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: name, bold: true, size: 52, color: "1a237e" })],
          spacing: { after: 60 },
        }),
        // Title
        roles ? new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: roles, size: 24, color: "555555", italics: true })],
          spacing: { after: 80 },
        }) : null,
        // Contact
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: contactLine, size: 18, color: "444444" })],
          spacing: { after: 120 },
        }),
        HR(),
      ].filter(Boolean);

      // Summary
      if (bio) {
        sections.push(SectionHead("Professional Summary"));
        sections.push(new Paragraph({ text: bio, spacing: { after: 80 }, run: { size: 20 } }));
      }

      // Experience
      if (experiences.length) {
        sections.push(SectionHead("Work Experience"));
        for (const exp of experiences) {
          sections.push(new Paragraph({
            children: [
              new TextRun({ text: exp.role, bold: true, size: 22 }),
              new TextRun({ text: `  —  ${exp.company}`, size: 22, color: "555555" }),
              new TextRun({ text: `  |  ${exp.period}`, size: 20, color: "888888", italics: true }),
            ],
            spacing: { before: 120, after: 40 },
          }));
          for (const pt of (exp.points || [])) {
            sections.push(bullet(pt));
          }
        }
      }

      // Education
      if (education.length) {
        sections.push(SectionHead("Education"));
        for (const edu of education) {
          sections.push(new Paragraph({
            children: [
              new TextRun({ text: edu.role, bold: true, size: 22 }),
              new TextRun({ text: `  —  ${edu.company}`, size: 22, color: "555555" }),
              new TextRun({ text: `  |  ${edu.period}`, size: 20, color: "888888", italics: true }),
            ],
            spacing: { before: 120, after: 40 },
          }));
          for (const pt of (edu.points || [])) {
            sections.push(bullet(pt));
          }
        }
      }

      // Skills
      if (skills.length) {
        sections.push(SectionHead("Skills"));
        const skillsByCategory: Record<string, any[]> = {};
        skills.forEach((s: any) => {
          const cat = s.category || "General";
          if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
          skillsByCategory[cat].push(s);
        });
        for (const [cat, catSkills] of Object.entries(skillsByCategory)) {
          sections.push(new Paragraph({
            children: [
              new TextRun({ text: `${cat}: `, bold: true, size: 20 }),
              new TextRun({ text: catSkills.map((s: any) => s.label).join(", "), size: 20, color: "333333" }),
            ],
            spacing: { after: 60 },
          }));
        }
      }

      // Projects
      if (projects.length) {
        sections.push(SectionHead("Projects"));
        for (const p of projects) {
          const projectChildren: any[] = [new TextRun({ text: p.title, bold: true, size: 22 })];
          if (p.featured) projectChildren.push(new TextRun({ text: "  ★ Featured", size: 18, color: "7c3aed" }));
          sections.push(new Paragraph({ children: projectChildren, spacing: { before: 100, after: 40 } }));
          if (p.description) {
            sections.push(new Paragraph({ text: p.description, spacing: { after: 40 }, run: { size: 19, color: "444444" } }));
          }
          if ((p.tags || []).length) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: `Tags: ${p.tags.join(", ")}`, size: 18, color: "666666", italics: true })],
              spacing: { after: 60 },
            }));
          }
        }
      }

      // Achievements
      if (achievements.length) {
        sections.push(SectionHead("Achievements"));
        for (const a of achievements) {
          sections.push(bullet(a.title));
        }
      }

      const doc = new Document({
        styles: {
          default: {
            heading2: {
              run: { size: 24, bold: true, color: "1a237e" },
              paragraph: { spacing: { before: 200, after: 80 } },
            },
          },
        },
        sections: [{ properties: {}, children: sections }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}_resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Word generation error", e);
      alert("Word document generation failed. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  // ── Data checks ─────────────────────────────────────────────────────────────
  const hasData = resumeData && (
    resumeData.hero?.name || resumeData.about?.bio1 ||
    (resumeData.experiences || []).length > 0 || (resumeData.skills || []).length > 0
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>Loading your portfolio data...</span>
      </div>
    );
  }

  return (
    <div className={styles.builderWrap}>
      {/* Page Header */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <h1>Resume Builder</h1>
          <p>Generate a beautiful PDF or Word resume from your portfolio data</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPdf} onClick={handleDownloadPDF} disabled={!!generating || !hasData}>
            {generating === "pdf" ? "⏳ Generating..." : "📄 Download PDF"}
          </button>
          <button className={styles.btnWord} onClick={handleDownloadWord} disabled={!!generating || !hasData}>
            {generating === "word" ? "⏳ Generating..." : "📝 Download Word"}
          </button>
        </div>
      </div>

      {/* No data warning */}
      {!hasData && (
        <div className={styles.noDataBanner}>
          ⚠️ Your portfolio has no data yet. Add your profile, experience, and skills first — then come back to generate your resume.
        </div>
      )}

      {/* Main layout */}
      <div className={styles.mainLayout}>
        {/* ── Template Picker ── */}
        <div className={styles.pickerPanel}>
          {/* Tab Switcher */}
          <div className={styles.tabSwitcher}>
            <button
              className={`${styles.tabBtn} ${activeTab === "style" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("style")}
            >
              Style Templates
              <span className={styles.tabCount}>{TEMPLATES.length}</span>
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "company" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("company")}
            >
              Company Templates
              <span className={styles.tabCount}>{COMPANY_TEMPLATES.length}</span>
            </button>
          </div>

          {/* Style Templates Tab */}
          {activeTab === "style" && (
            <div className={styles.templateGrid}>
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  className={`${styles.templateCard} ${selectedTemplate.id === t.id ? styles.templateCardActive : ""}`}
                  onClick={() => setSelectedTemplate(t)}
                  title={t.desc}
                >
                  <div className={styles.templateThumb}>
                    <TemplateThumbnail template={t} />
                  </div>
                  <div className={styles.templateMeta}>
                    <div className={styles.templateName}>{t.emoji} {t.name}</div>
                    <div className={styles.templateDesc}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Company Templates Tab */}
          {activeTab === "company" && (
            <div className={styles.companyPickerWrap}>
              <div className={styles.companyHint}>
                Select a company to apply their preferred resume style and format.
              </div>
              {/* Group companies by category */}
              {["Big Tech", "Startup/Tech", "Consulting", "Finance"].map(cat => {
                const companies = COMPANY_INFO.filter(c => c.category === cat);
                if (!companies.length) return null;
                return (
                  <div key={cat} className={styles.companyCategoryGroup}>
                    <div className={styles.companyCategoryLabel}>{cat}</div>
                    <div className={styles.companyGrid}>
                      {companies.map(company => {
                        const tpl = COMPANY_TEMPLATES.find(t => t.id === company.templateId);
                        const isSelected = selectedTemplate.id === company.templateId;
                        return (
                          <div
                            key={company.id}
                            className={`${styles.companyCard} ${isSelected ? styles.companyCardActive : ""}`}
                            onClick={() => tpl && setSelectedTemplate(tpl)}
                            title={company.hint}
                          >
                            <div
                              className={styles.companyBadge}
                              style={{ background: company.bgColor, color: company.color, borderColor: company.color + "44" }}
                            >
                              <span className={styles.companyInitial} style={{ color: company.color }}>
                                {company.name.charAt(0)}
                              </span>
                            </div>
                            <div className={styles.companyMeta}>
                              <div className={styles.companyName} style={isSelected ? { color: company.color } : {}}>
                                {company.name}
                              </div>
                              <div className={styles.companyDesc}>{company.hint}</div>
                            </div>
                            {isSelected && (
                              <div className={styles.companyCheck} style={{ color: company.color }}>✓</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Company hint box when selected */}
              {selectedTemplate.isCompanyTemplate && selectedTemplate.companyHint && (
                <div className={styles.companyTipBox}>
                  <div className={styles.companyTipTitle}>
                    💡 {selectedTemplate.companyName} Resume Tips
                  </div>
                  <div className={styles.companyTipText}>{selectedTemplate.companyHint}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Preview Panel ── */}
        <div className={styles.previewPanel}>
          <div className={styles.previewPanelHeader}>
            <span className={styles.previewLabel}>Live Preview</span>
            <span className={styles.previewSelectedBadge}>
              {selectedTemplate.emoji} {selectedTemplate.name}
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>
                · {selectedTemplate.layout === "sidebar" ? "Sidebar" : "Single Column"}
              </span>
            </span>
          </div>

          <div className={styles.paperWrap}>
            <div className={styles.paperOuter}>
              {resumeData && (
                <ResumePreview data={resumeData} template={selectedTemplate} />
              )}
              {!resumeData && (
                <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#ffffff" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>📄</div>
                  <div>Add portfolio data to preview your resume</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
              Generating resume for <strong>{userName}</strong> using <strong>{selectedTemplate.name}</strong> template
            </div>
            <div className={styles.actionBtns}>
              <button className={styles.btnSecondary} onClick={fetchData}>↺ Refresh Data</button>
              <button className={styles.btnPdf} onClick={handleDownloadPDF} disabled={!!generating || !hasData}>
                {generating === "pdf" ? "⏳ Generating..." : "📄 Download PDF"}
              </button>
              <button className={styles.btnWord} onClick={handleDownloadWord} disabled={!!generating || !hasData}>
                {generating === "word" ? "⏳ Generating..." : "📝 Download Word"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size capture div (794px = A4 width at 96dpi) */}
      <div className={styles.captureRoot} ref={captureRef} style={{ width: 794 }}>
        {resumeData && (
          <ResumePreview data={resumeData} template={selectedTemplate} forCapture />
        )}
      </div>
    </div>
  );
}
