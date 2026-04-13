export interface ResumeTemplate {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  layout: "single" | "sidebar";
  // Header
  headerBg: string;
  headerText: string;
  headerSubtext: string;
  headerAccent: string;
  // Body
  bodyBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Section titles
  sectionTitle: string;
  sectionBorderColor: string;
  sectionBorderStyle: "bottom-line" | "left-bar" | "bg-fill" | "top-thick";
  sectionTitleBg?: string;
  // Sidebar (only if layout === 'sidebar')
  sidebarBg: string;
  sidebarText: string;
  sidebarMuted: string;
  sidebarAccent: string;
  // Tags / skill chips
  tagBg: string;
  tagColor: string;
  tagBorder: string;
  // Skill bar
  skillBarTrack: string;
  skillBarFill: string;
  // Divider
  dividerColor: string;
  // Typography
  fontFamily: string;
  headingFamily: string;
  // Misc
  accentDot: string;
  // Company template metadata (optional)
  isCompanyTemplate?: boolean;
  companyId?: string;
  companyName?: string;
  companyColor?: string;
  companyHint?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  category: string;
  hint: string;
  templateId: string;
}

export const TEMPLATES: ResumeTemplate[] = [
  // ── 1 ─ Classic White
  {
    id: "classic-white", name: "Classic White", emoji: "📄", desc: "Traditional clean resume",
    layout: "single",
    headerBg: "#1a237e", headerText: "#ffffff", headerSubtext: "#90caf9", headerAccent: "#42a5f5",
    bodyBg: "#ffffff", textPrimary: "#1a1a2e", textSecondary: "#2c3e50", textMuted: "#7f8c8d",
    sectionTitle: "#1a237e", sectionBorderColor: "#1a237e", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f5f5f5", sidebarText: "#1a1a2e", sidebarMuted: "#7f8c8d", sidebarAccent: "#1a237e",
    tagBg: "#e3f2fd", tagColor: "#1565c0", tagBorder: "#90caf9",
    skillBarTrack: "#e3f2fd", skillBarFill: "#1a237e",
    dividerColor: "#e3f2fd", fontFamily: "Georgia, serif", headingFamily: "Georgia, serif", accentDot: "#42a5f5",
  },
  // ── 2 ─ Navy Executive
  {
    id: "navy-executive", name: "Navy Executive", emoji: "🏛️", desc: "Corporate navy with gold",
    layout: "sidebar",
    headerBg: "#0d2137", headerText: "#ffffff", headerSubtext: "#f39c12", headerAccent: "#f39c12",
    bodyBg: "#ffffff", textPrimary: "#1a1a2e", textSecondary: "#2c3e50", textMuted: "#7f8c8d",
    sectionTitle: "#0d2137", sectionBorderColor: "#f39c12", sectionBorderStyle: "left-bar",
    sidebarBg: "#0d2137", sidebarText: "#ecf0f1", sidebarMuted: "#95a5a6", sidebarAccent: "#f39c12",
    tagBg: "#fef9e7", tagColor: "#d68910", tagBorder: "#f39c12",
    skillBarTrack: "#1a3a52", skillBarFill: "#f39c12",
    dividerColor: "#d5e8d4", fontFamily: "Arial, sans-serif", headingFamily: "'Trebuchet MS', sans-serif", accentDot: "#f39c12",
  },
  // ── 3 ─ Modern Purple
  {
    id: "modern-purple", name: "Modern Purple", emoji: "💜", desc: "Contemporary purple gradient",
    layout: "single",
    headerBg: "#6c3483", headerText: "#ffffff", headerSubtext: "#e8daef", headerAccent: "#a569bd",
    bodyBg: "#fafafa", textPrimary: "#1a1a2e", textSecondary: "#4a235a", textMuted: "#7d6b7d",
    sectionTitle: "#6c3483", sectionBorderColor: "#a569bd", sectionBorderStyle: "left-bar",
    sidebarBg: "#f4ecf7", sidebarText: "#4a235a", sidebarMuted: "#7d6b7d", sidebarAccent: "#6c3483",
    tagBg: "#f4ecf7", tagColor: "#6c3483", tagBorder: "#a569bd",
    skillBarTrack: "#e8daef", skillBarFill: "#6c3483",
    dividerColor: "#e8daef", fontFamily: "'Segoe UI', sans-serif", headingFamily: "'Segoe UI', sans-serif", accentDot: "#a569bd",
  },
  // ── 4 ─ Teal Minimal
  {
    id: "teal-minimal", name: "Teal Minimal", emoji: "🌊", desc: "Clean teal with minimal design",
    layout: "single",
    headerBg: "#00695c", headerText: "#ffffff", headerSubtext: "#b2dfdb", headerAccent: "#26a69a",
    bodyBg: "#ffffff", textPrimary: "#1c2833", textSecondary: "#2e4057", textMuted: "#808b96",
    sectionTitle: "#00695c", sectionBorderColor: "#00695c", sectionBorderStyle: "bottom-line",
    sidebarBg: "#e0f2f1", sidebarText: "#00352c", sidebarMuted: "#546e7a", sidebarAccent: "#00695c",
    tagBg: "#e0f2f1", tagColor: "#00695c", tagBorder: "#80cbc4",
    skillBarTrack: "#e0f2f1", skillBarFill: "#00695c",
    dividerColor: "#e0f2f1", fontFamily: "'Helvetica Neue', sans-serif", headingFamily: "'Helvetica Neue', sans-serif", accentDot: "#26a69a",
  },
  // ── 5 ─ Coral Creative
  {
    id: "coral-creative", name: "Coral Creative", emoji: "🎨", desc: "Warm coral for creatives",
    layout: "sidebar",
    headerBg: "#c0392b", headerText: "#ffffff", headerSubtext: "#fadbd8", headerAccent: "#f1948a",
    bodyBg: "#fffcfc", textPrimary: "#2c0000", textSecondary: "#4a1a1a", textMuted: "#8a6b6b",
    sectionTitle: "#c0392b", sectionBorderColor: "#e74c3c", sectionBorderStyle: "top-thick",
    sidebarBg: "#fdedec", sidebarText: "#2c0000", sidebarMuted: "#8a6b6b", sidebarAccent: "#c0392b",
    tagBg: "#fadbd8", tagColor: "#c0392b", tagBorder: "#f1948a",
    skillBarTrack: "#fadbd8", skillBarFill: "#c0392b",
    dividerColor: "#fadbd8", fontFamily: "'Open Sans', sans-serif", headingFamily: "'Open Sans', sans-serif", accentDot: "#f1948a",
  },
  // ── 6 ─ Forest Professional
  {
    id: "forest-pro", name: "Forest Pro", emoji: "🌿", desc: "Nature-inspired deep green",
    layout: "sidebar",
    headerBg: "#145a32", headerText: "#ffffff", headerSubtext: "#a9dfbf", headerAccent: "#27ae60",
    bodyBg: "#ffffff", textPrimary: "#0d1f0d", textSecondary: "#1e5128", textMuted: "#7a9e7a",
    sectionTitle: "#145a32", sectionBorderColor: "#27ae60", sectionBorderStyle: "left-bar",
    sidebarBg: "#145a32", sidebarText: "#ecf0f1", sidebarMuted: "#a9dfbf", sidebarAccent: "#27ae60",
    tagBg: "#eafaf1", tagColor: "#145a32", tagBorder: "#a9dfbf",
    skillBarTrack: "#1e5128", skillBarFill: "#27ae60",
    dividerColor: "#d5e8d4", fontFamily: "Verdana, sans-serif", headingFamily: "Verdana, sans-serif", accentDot: "#27ae60",
  },
  // ── 7 ─ Midnight Dark
  {
    id: "midnight-dark", name: "Midnight Dark", emoji: "🌙", desc: "Premium full dark theme",
    layout: "single",
    headerBg: "#0a0e1a", headerText: "#e2e8f0", headerSubtext: "#64748b", headerAccent: "#38bdf8",
    bodyBg: "#0f1525", textPrimary: "#e2e8f0", textSecondary: "#94a3b8", textMuted: "#475569",
    sectionTitle: "#38bdf8", sectionBorderColor: "#1e40af", sectionBorderStyle: "bottom-line",
    sidebarBg: "#0a0e1a", sidebarText: "#e2e8f0", sidebarMuted: "#64748b", sidebarAccent: "#38bdf8",
    tagBg: "#1e293b", tagColor: "#38bdf8", tagBorder: "#334155",
    skillBarTrack: "#1e293b", skillBarFill: "#38bdf8",
    dividerColor: "#1e293b", fontFamily: "'Segoe UI', sans-serif", headingFamily: "'Segoe UI', sans-serif", accentDot: "#38bdf8",
  },
  // ── 8 ─ Gold Luxury
  {
    id: "gold-luxury", name: "Gold Luxury", emoji: "👑", desc: "Black and gold prestige",
    layout: "sidebar",
    headerBg: "#1a1a1a", headerText: "#d4af37", headerSubtext: "#b8941f", headerAccent: "#d4af37",
    bodyBg: "#ffffff", textPrimary: "#1a1a1a", textSecondary: "#3d3d3d", textMuted: "#888888",
    sectionTitle: "#1a1a1a", sectionBorderColor: "#d4af37", sectionBorderStyle: "left-bar",
    sidebarBg: "#1a1a1a", sidebarText: "#f5e6c8", sidebarMuted: "#c4a96b", sidebarAccent: "#d4af37",
    tagBg: "#fefce8", tagColor: "#92400e", tagBorder: "#d4af37",
    skillBarTrack: "#333333", skillBarFill: "#d4af37",
    dividerColor: "#f5e6c8", fontFamily: "Georgia, serif", headingFamily: "Georgia, serif", accentDot: "#d4af37",
  },
  // ── 9 ─ Crimson Bold
  {
    id: "crimson-bold", name: "Crimson Bold", emoji: "🔴", desc: "Bold crimson with strong typography",
    layout: "single",
    headerBg: "#7b0000", headerText: "#ffffff", headerSubtext: "#ffcdd2", headerAccent: "#ef5350",
    bodyBg: "#fffff8", textPrimary: "#1a0000", textSecondary: "#3e0000", textMuted: "#8c6969",
    sectionTitle: "#7b0000", sectionBorderColor: "#7b0000", sectionBorderStyle: "top-thick",
    sidebarBg: "#fff5f5", sidebarText: "#1a0000", sidebarMuted: "#8c6969", sidebarAccent: "#7b0000",
    tagBg: "#ffebee", tagColor: "#7b0000", tagBorder: "#ef9a9a",
    skillBarTrack: "#ffcdd2", skillBarFill: "#7b0000",
    dividerColor: "#ffcdd2", fontFamily: "'Times New Roman', serif", headingFamily: "'Times New Roman', serif", accentDot: "#ef5350",
  },
  // ── 10 ─ Slate Tech
  {
    id: "slate-tech", name: "Slate Tech", emoji: "⚙️", desc: "Dark slate for tech professionals",
    layout: "sidebar",
    headerBg: "#1e2a3a", headerText: "#e2e8f0", headerSubtext: "#06b6d4", headerAccent: "#06b6d4",
    bodyBg: "#f8fafc", textPrimary: "#0f172a", textSecondary: "#1e293b", textMuted: "#64748b",
    sectionTitle: "#1e2a3a", sectionBorderColor: "#06b6d4", sectionBorderStyle: "left-bar",
    sidebarBg: "#1e2a3a", sidebarText: "#e2e8f0", sidebarMuted: "#94a3b8", sidebarAccent: "#06b6d4",
    tagBg: "#ecfeff", tagColor: "#0e7490", tagBorder: "#67e8f9",
    skillBarTrack: "#334155", skillBarFill: "#06b6d4",
    dividerColor: "#e2e8f0", fontFamily: "'Courier New', monospace", headingFamily: "'Segoe UI', sans-serif", accentDot: "#06b6d4",
  },
  // ── 11 ─ Lavender Soft
  {
    id: "lavender-soft", name: "Lavender Soft", emoji: "🪻", desc: "Soft lavender elegant style",
    layout: "single",
    headerBg: "#5c3d8f", headerText: "#ffffff", headerSubtext: "#d7c8f0", headerAccent: "#9b72cf",
    bodyBg: "#fdfbff", textPrimary: "#1e1030", textSecondary: "#3d2264", textMuted: "#8b7aab",
    sectionTitle: "#5c3d8f", sectionBorderColor: "#c8a8e9", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f3ecfd", sidebarText: "#1e1030", sidebarMuted: "#8b7aab", sidebarAccent: "#5c3d8f",
    tagBg: "#ede7f6", tagColor: "#4527a0", tagBorder: "#c5b3e6",
    skillBarTrack: "#ede7f6", skillBarFill: "#7b1fa2",
    dividerColor: "#ede7f6", fontFamily: "Palatino, serif", headingFamily: "Palatino, serif", accentDot: "#9b72cf",
  },
  // ── 12 ─ Sky Corporate
  {
    id: "sky-corporate", name: "Sky Corporate", emoji: "☁️", desc: "Light blue clean corporate",
    layout: "sidebar",
    headerBg: "#0277bd", headerText: "#ffffff", headerSubtext: "#b3e5fc", headerAccent: "#29b6f6",
    bodyBg: "#f5f9ff", textPrimary: "#0d1b2a", textSecondary: "#1565c0", textMuted: "#5c6bc0",
    sectionTitle: "#0277bd", sectionBorderColor: "#0277bd", sectionBorderStyle: "bg-fill",
    sectionTitleBg: "#e3f2fd",
    sidebarBg: "#e3f2fd", sidebarText: "#0d1b2a", sidebarMuted: "#5c6bc0", sidebarAccent: "#0277bd",
    tagBg: "#e1f5fe", tagColor: "#01579b", tagBorder: "#81d4fa",
    skillBarTrack: "#b3e5fc", skillBarFill: "#0277bd",
    dividerColor: "#b3e5fc", fontFamily: "Calibri, sans-serif", headingFamily: "Calibri, sans-serif", accentDot: "#29b6f6",
  },
  // ── 13 ─ Rose Gold
  {
    id: "rose-gold", name: "Rose Gold", emoji: "🌸", desc: "Rose gold sophisticated style",
    layout: "sidebar",
    headerBg: "#880e4f", headerText: "#ffffff", headerSubtext: "#f8bbd9", headerAccent: "#f48fb1",
    bodyBg: "#fff9fb", textPrimary: "#2d0010", textSecondary: "#4a0020", textMuted: "#9c6b7e",
    sectionTitle: "#880e4f", sectionBorderColor: "#f48fb1", sectionBorderStyle: "left-bar",
    sidebarBg: "#fce4ec", sidebarText: "#2d0010", sidebarMuted: "#9c6b7e", sidebarAccent: "#880e4f",
    tagBg: "#fce4ec", tagColor: "#880e4f", tagBorder: "#f48fb1",
    skillBarTrack: "#f8bbd9", skillBarFill: "#c2185b",
    dividerColor: "#f8bbd9", fontFamily: "Georgia, serif", headingFamily: "Georgia, serif", accentDot: "#f48fb1",
  },
  // ── 14 ─ Carbon Minimal
  {
    id: "carbon-minimal", name: "Carbon Minimal", emoji: "🖤", desc: "Dark charcoal ultra minimal",
    layout: "single",
    headerBg: "#212121", headerText: "#fafafa", headerSubtext: "#9e9e9e", headerAccent: "#ffffff",
    bodyBg: "#303030", textPrimary: "#fafafa", textSecondary: "#e0e0e0", textMuted: "#9e9e9e",
    sectionTitle: "#fafafa", sectionBorderColor: "#616161", sectionBorderStyle: "bottom-line",
    sidebarBg: "#212121", sidebarText: "#fafafa", sidebarMuted: "#9e9e9e", sidebarAccent: "#ffffff",
    tagBg: "#424242", tagColor: "#fafafa", tagBorder: "#616161",
    skillBarTrack: "#424242", skillBarFill: "#fafafa",
    dividerColor: "#424242", fontFamily: "'Helvetica Neue', sans-serif", headingFamily: "'Helvetica Neue', sans-serif", accentDot: "#bdbdbd",
  },
  // ── 15 ─ Sunset Gradient
  {
    id: "sunset-gradient", name: "Sunset Gradient", emoji: "🌅", desc: "Warm sunset orange-pink",
    layout: "single",
    headerBg: "#e65100", headerText: "#ffffff", headerSubtext: "#ffe0b2", headerAccent: "#ffab40",
    bodyBg: "#fffbf8", textPrimary: "#1a0800", textSecondary: "#3e1f00", textMuted: "#9e6b3e",
    sectionTitle: "#e65100", sectionBorderColor: "#ff6d00", sectionBorderStyle: "left-bar",
    sidebarBg: "#fff3e0", sidebarText: "#1a0800", sidebarMuted: "#9e6b3e", sidebarAccent: "#e65100",
    tagBg: "#fff3e0", tagColor: "#e65100", tagBorder: "#ffcc80",
    skillBarTrack: "#ffe0b2", skillBarFill: "#e65100",
    dividerColor: "#ffe0b2", fontFamily: "'Open Sans', sans-serif", headingFamily: "'Open Sans', sans-serif", accentDot: "#ffab40",
  },
  // ── 16 ─ Academic Classic
  {
    id: "academic-classic", name: "Academic", emoji: "🎓", desc: "Academic research formal style",
    layout: "single",
    headerBg: "#ffffff", headerText: "#1a1a1a", headerSubtext: "#555555", headerAccent: "#333333",
    bodyBg: "#ffffff", textPrimary: "#1a1a1a", textSecondary: "#333333", textMuted: "#777777",
    sectionTitle: "#1a1a1a", sectionBorderColor: "#1a1a1a", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f0f0f0", sidebarText: "#1a1a1a", sidebarMuted: "#777777", sidebarAccent: "#333333",
    tagBg: "#f0f0f0", tagColor: "#333333", tagBorder: "#bbbbbb",
    skillBarTrack: "#e0e0e0", skillBarFill: "#333333",
    dividerColor: "#cccccc", fontFamily: "'Times New Roman', serif", headingFamily: "'Times New Roman', serif", accentDot: "#555555",
  },
  // ── 17 ─ Indigo Deep
  {
    id: "indigo-deep", name: "Indigo Deep", emoji: "🔷", desc: "Deep indigo modern design",
    layout: "sidebar",
    headerBg: "#1a237e", headerText: "#ffffff", headerSubtext: "#9fa8da", headerAccent: "#7986cb",
    bodyBg: "#f8f9ff", textPrimary: "#0d0f3d", textSecondary: "#1a237e", textMuted: "#7986cb",
    sectionTitle: "#1a237e", sectionBorderColor: "#3949ab", sectionBorderStyle: "bg-fill",
    sectionTitleBg: "#e8eaf6",
    sidebarBg: "#1a237e", sidebarText: "#ffffff", sidebarMuted: "#9fa8da", sidebarAccent: "#7986cb",
    tagBg: "#e8eaf6", tagColor: "#1a237e", tagBorder: "#9fa8da",
    skillBarTrack: "#283593", skillBarFill: "#7986cb",
    dividerColor: "#c5cae9", fontFamily: "Roboto, sans-serif", headingFamily: "Roboto, sans-serif", accentDot: "#7986cb",
  },
  // ── 18 ─ Olive Executive
  {
    id: "olive-exec", name: "Olive Executive", emoji: "🫒", desc: "Military olive professional",
    layout: "sidebar",
    headerBg: "#33691e", headerText: "#ffffff", headerSubtext: "#dcedc8", headerAccent: "#8bc34a",
    bodyBg: "#fffffe", textPrimary: "#1b2015", textSecondary: "#2e4012", textMuted: "#7a9060",
    sectionTitle: "#33691e", sectionBorderColor: "#558b2f", sectionBorderStyle: "left-bar",
    sidebarBg: "#33691e", sidebarText: "#f9fbe7", sidebarMuted: "#aed581", sidebarAccent: "#8bc34a",
    tagBg: "#f1f8e9", tagColor: "#33691e", tagBorder: "#aed581",
    skillBarTrack: "#3e6b21", skillBarFill: "#8bc34a",
    dividerColor: "#dcedc8", fontFamily: "Verdana, sans-serif", headingFamily: "Verdana, sans-serif", accentDot: "#8bc34a",
  },
  // ── 19 ─ Emerald Elegant
  {
    id: "emerald-elegant", name: "Emerald Elegant", emoji: "💎", desc: "Elegant emerald with serif",
    layout: "single",
    headerBg: "#004d40", headerText: "#e0f2f1", headerSubtext: "#80cbc4", headerAccent: "#26a69a",
    bodyBg: "#f9fffd", textPrimary: "#001a16", textSecondary: "#00352c", textMuted: "#6a9e98",
    sectionTitle: "#004d40", sectionBorderColor: "#009688", sectionBorderStyle: "bottom-line",
    sidebarBg: "#e0f2f1", sidebarText: "#001a16", sidebarMuted: "#6a9e98", sidebarAccent: "#004d40",
    tagBg: "#e0f2f1", tagColor: "#004d40", tagBorder: "#80cbc4",
    skillBarTrack: "#b2dfdb", skillBarFill: "#004d40",
    dividerColor: "#b2dfdb", fontFamily: "Garamond, Georgia, serif", headingFamily: "Garamond, Georgia, serif", accentDot: "#26a69a",
  },
  // ── 20 ─ Electric Neon
  {
    id: "electric-neon", name: "Electric Neon", emoji: "⚡", desc: "Dark background, neon accents",
    layout: "sidebar",
    headerBg: "#03001c", headerText: "#00fff7", headerSubtext: "#7b2fff", headerAccent: "#00fff7",
    bodyBg: "#080014", textPrimary: "#e8e8ff", textSecondary: "#a0a0d0", textMuted: "#6060a0",
    sectionTitle: "#00fff7", sectionBorderColor: "#7b2fff", sectionBorderStyle: "left-bar",
    sidebarBg: "#03001c", sidebarText: "#e8e8ff", sidebarMuted: "#6060a0", sidebarAccent: "#00fff7",
    tagBg: "#1a0030", tagColor: "#00fff7", tagBorder: "#7b2fff",
    skillBarTrack: "#1a0030", skillBarFill: "#00fff7",
    dividerColor: "#1a0030", fontFamily: "'Courier New', monospace", headingFamily: "'Segoe UI', sans-serif", accentDot: "#7b2fff",
  },
];

// ── Company Templates ────────────────────────────────────────────────────────
// Inspired by ATS-friendly resume formats preferred by top companies
// Based on publicly available career guides and open-source resume templates

export const COMPANY_TEMPLATES: ResumeTemplate[] = [
  // ── Google ─ Clean ATS-friendly (Inspired by Google's preferred resume format)
  {
    id: "company-google", name: "Google Style", emoji: "🔵", desc: "ATS-friendly, clean & structured",
    layout: "single",
    isCompanyTemplate: true, companyId: "google", companyName: "Google",
    companyColor: "#4285F4", companyHint: "Prefers clean ATS-friendly resumes with clear section hierarchy and measurable impact bullets.",
    headerBg: "#ffffff", headerText: "#202124", headerSubtext: "#5f6368", headerAccent: "#4285F4",
    bodyBg: "#ffffff", textPrimary: "#202124", textSecondary: "#3c4043", textMuted: "#80868b",
    sectionTitle: "#202124", sectionBorderColor: "#4285F4", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f8f9fa", sidebarText: "#202124", sidebarMuted: "#80868b", sidebarAccent: "#4285F4",
    tagBg: "#e8f0fe", tagColor: "#1a73e8", tagBorder: "#aecbfa",
    skillBarTrack: "#e8f0fe", skillBarFill: "#4285F4",
    dividerColor: "#dadce0", fontFamily: "Arial, sans-serif", headingFamily: "Arial, sans-serif", accentDot: "#4285F4",
  },
  // ── Amazon ─ Impact-driven STAR format
  {
    id: "company-amazon", name: "Amazon Style", emoji: "🟠", desc: "Impact-driven, STAR-method bullets",
    layout: "sidebar",
    isCompanyTemplate: true, companyId: "amazon", companyName: "Amazon",
    companyColor: "#FF9900", companyHint: "Focuses on measurable impact using STAR method. Leadership Principles in bullet points. Skills sidebar preferred.",
    headerBg: "#232F3E", headerText: "#ffffff", headerSubtext: "#FF9900", headerAccent: "#FF9900",
    bodyBg: "#ffffff", textPrimary: "#111111", textSecondary: "#232F3E", textMuted: "#767676",
    sectionTitle: "#232F3E", sectionBorderColor: "#FF9900", sectionBorderStyle: "left-bar",
    sidebarBg: "#232F3E", sidebarText: "#ffffff", sidebarMuted: "#aaaaaa", sidebarAccent: "#FF9900",
    tagBg: "#fff8ee", tagColor: "#c45000", tagBorder: "#FF9900",
    skillBarTrack: "#37475A", skillBarFill: "#FF9900",
    dividerColor: "#e7e7e7", fontFamily: "Arial, sans-serif", headingFamily: "Arial, sans-serif", accentDot: "#FF9900",
  },
  // ── Microsoft ─ Professional and structured
  {
    id: "company-microsoft", name: "Microsoft Style", emoji: "🪟", desc: "Structured, professional blue",
    layout: "sidebar",
    isCompanyTemplate: true, companyId: "microsoft", companyName: "Microsoft",
    companyColor: "#00A4EF", companyHint: "Values clear structure, growth mindset. Prefers sidebar layout with skills prominently displayed.",
    headerBg: "#0078D4", headerText: "#ffffff", headerSubtext: "#c8e6fa", headerAccent: "#50e6ff",
    bodyBg: "#f3f2f1", textPrimary: "#201f1e", textSecondary: "#323130", textMuted: "#605e5c",
    sectionTitle: "#0078D4", sectionBorderColor: "#0078D4", sectionBorderStyle: "bg-fill",
    sectionTitleBg: "#deecf9",
    sidebarBg: "#0078D4", sidebarText: "#ffffff", sidebarMuted: "#c8e6fa", sidebarAccent: "#50e6ff",
    tagBg: "#deecf9", tagColor: "#004578", tagBorder: "#c7e0f4",
    skillBarTrack: "#005a9e", skillBarFill: "#50e6ff",
    dividerColor: "#edebe9", fontFamily: "Segoe UI, Arial, sans-serif", headingFamily: "Segoe UI, Arial, sans-serif", accentDot: "#50e6ff",
  },
  // ── Meta ─ Bold and modern
  {
    id: "company-meta", name: "Meta Style", emoji: "🔷", desc: "Bold, modern & impact-focused",
    layout: "single",
    isCompanyTemplate: true, companyId: "meta", companyName: "Meta",
    companyColor: "#0866FF", companyHint: "Looks for bold impact statements, cross-functional collaboration, and scale. Move fast emphasis.",
    headerBg: "#0866FF", headerText: "#ffffff", headerSubtext: "#cfe2ff", headerAccent: "#ffffff",
    bodyBg: "#ffffff", textPrimary: "#1c1e21", textSecondary: "#3b3f45", textMuted: "#65676b",
    sectionTitle: "#0866FF", sectionBorderColor: "#0866FF", sectionBorderStyle: "left-bar",
    sidebarBg: "#f0f2f5", sidebarText: "#1c1e21", sidebarMuted: "#65676b", sidebarAccent: "#0866FF",
    tagBg: "#e7f3ff", tagColor: "#0866FF", tagBorder: "#a8c8ff",
    skillBarTrack: "#e7f3ff", skillBarFill: "#0866FF",
    dividerColor: "#e4e6eb", fontFamily: "'Helvetica Neue', Arial, sans-serif", headingFamily: "'Helvetica Neue', Arial, sans-serif", accentDot: "#0866FF",
  },
  // ── Apple ─ Ultra minimal, elegant
  {
    id: "company-apple", name: "Apple Style", emoji: "🍎", desc: "Ultra minimal, typography-first",
    layout: "single",
    isCompanyTemplate: true, companyId: "apple", companyName: "Apple",
    companyColor: "#000000", companyHint: "Extreme attention to detail and design. Clean minimal layout. Typography and craft over decoration.",
    headerBg: "#ffffff", headerText: "#1d1d1f", headerSubtext: "#515154", headerAccent: "#1d1d1f",
    bodyBg: "#ffffff", textPrimary: "#1d1d1f", textSecondary: "#3d3d3f", textMuted: "#86868b",
    sectionTitle: "#1d1d1f", sectionBorderColor: "#d2d2d7", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f5f5f7", sidebarText: "#1d1d1f", sidebarMuted: "#86868b", sidebarAccent: "#1d1d1f",
    tagBg: "#f5f5f7", tagColor: "#1d1d1f", tagBorder: "#d2d2d7",
    skillBarTrack: "#e8e8ed", skillBarFill: "#1d1d1f",
    dividerColor: "#d2d2d7", fontFamily: "-apple-system, 'SF Pro Text', Helvetica, Arial, sans-serif", headingFamily: "-apple-system, 'SF Pro Display', Helvetica, Arial, sans-serif", accentDot: "#6e6e73",
  },
  // ── Netflix ─ Dark bold theme
  {
    id: "company-netflix", name: "Netflix Style", emoji: "🎬", desc: "Bold red & dark, content-first",
    layout: "single",
    isCompanyTemplate: true, companyId: "netflix", companyName: "Netflix",
    companyColor: "#E50914", companyHint: "Seeks high performance, autonomous engineers. Bold, confident resume with clear ownership of past projects.",
    headerBg: "#141414", headerText: "#ffffff", headerSubtext: "#E50914", headerAccent: "#E50914",
    bodyBg: "#221f1f", textPrimary: "#ffffff", textSecondary: "#d9d9d9", textMuted: "#999999",
    sectionTitle: "#E50914", sectionBorderColor: "#E50914", sectionBorderStyle: "left-bar",
    sidebarBg: "#141414", sidebarText: "#ffffff", sidebarMuted: "#999999", sidebarAccent: "#E50914",
    tagBg: "#2d1a1a", tagColor: "#ff6b6b", tagBorder: "#E50914",
    skillBarTrack: "#333333", skillBarFill: "#E50914",
    dividerColor: "#333333", fontFamily: "'Helvetica Neue', Arial, sans-serif", headingFamily: "'Helvetica Neue', Arial, sans-serif", accentDot: "#E50914",
  },
  // ── Uber ─ Black & white bold
  {
    id: "company-uber", name: "Uber Style", emoji: "⬛", desc: "Monochrome bold, impact-focused",
    layout: "sidebar",
    isCompanyTemplate: true, companyId: "uber", companyName: "Uber",
    companyColor: "#000000", companyHint: "Values operational excellence and data-driven decisions. Bold, clean layout with measurable outcomes.",
    headerBg: "#000000", headerText: "#ffffff", headerSubtext: "#aaaaaa", headerAccent: "#ffffff",
    bodyBg: "#ffffff", textPrimary: "#000000", textSecondary: "#111111", textMuted: "#888888",
    sectionTitle: "#000000", sectionBorderColor: "#000000", sectionBorderStyle: "top-thick",
    sidebarBg: "#000000", sidebarText: "#ffffff", sidebarMuted: "#aaaaaa", sidebarAccent: "#ffffff",
    tagBg: "#f0f0f0", tagColor: "#000000", tagBorder: "#cccccc",
    skillBarTrack: "#333333", skillBarFill: "#ffffff",
    dividerColor: "#e0e0e0", fontFamily: "'UberMove', Arial, sans-serif", headingFamily: "'UberMove', Arial, sans-serif", accentDot: "#888888",
  },
  // ── Airbnb ─ Warm coral & modern
  {
    id: "company-airbnb", name: "Airbnb Style", emoji: "🏠", desc: "Warm coral, friendly & modern",
    layout: "sidebar",
    isCompanyTemplate: true, companyId: "airbnb", companyName: "Airbnb",
    companyColor: "#FF5A5F", companyHint: "Community-focused culture. Highlight collaboration, creativity, and belonging-focused accomplishments.",
    headerBg: "#FF5A5F", headerText: "#ffffff", headerSubtext: "#ffe4e5", headerAccent: "#ffffff",
    bodyBg: "#ffffff", textPrimary: "#222222", textSecondary: "#484848", textMuted: "#767676",
    sectionTitle: "#FF5A5F", sectionBorderColor: "#FF5A5F", sectionBorderStyle: "left-bar",
    sidebarBg: "#fff8f8", sidebarText: "#222222", sidebarMuted: "#767676", sidebarAccent: "#FF5A5F",
    tagBg: "#ffe4e5", tagColor: "#c0392b", tagBorder: "#ffb3b5",
    skillBarTrack: "#ffe4e5", skillBarFill: "#FF5A5F",
    dividerColor: "#ffe4e5", fontFamily: "Circular, 'Helvetica Neue', Arial, sans-serif", headingFamily: "Circular, 'Helvetica Neue', Arial, sans-serif", accentDot: "#FF5A5F",
  },
  // ── McKinsey ─ Consulting formal
  {
    id: "company-mckinsey", name: "McKinsey Style", emoji: "📊", desc: "Consulting formal, impact-metric heavy",
    layout: "single",
    isCompanyTemplate: true, companyId: "mckinsey", companyName: "McKinsey & Co",
    companyColor: "#003189", companyHint: "Structured problem-solving resume. Quantify every bullet. Clear leadership & impact at scale. Formal serif preferred.",
    headerBg: "#003189", headerText: "#ffffff", headerSubtext: "#99aacc", headerAccent: "#ffffff",
    bodyBg: "#ffffff", textPrimary: "#111111", textSecondary: "#333333", textMuted: "#777777",
    sectionTitle: "#003189", sectionBorderColor: "#003189", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f0f3fa", sidebarText: "#111111", sidebarMuted: "#777777", sidebarAccent: "#003189",
    tagBg: "#e6eaf5", tagColor: "#003189", tagBorder: "#99aacc",
    skillBarTrack: "#e6eaf5", skillBarFill: "#003189",
    dividerColor: "#c0cce8", fontFamily: "Georgia, 'Times New Roman', serif", headingFamily: "Georgia, 'Times New Roman', serif", accentDot: "#003189",
  },
  // ── Goldman Sachs ─ Finance formal
  {
    id: "company-goldman", name: "Goldman Sachs Style", emoji: "🏦", desc: "Finance formal, concise & precise",
    layout: "single",
    isCompanyTemplate: true, companyId: "goldman", companyName: "Goldman Sachs",
    companyColor: "#6699CC", companyHint: "Traditional finance resume: reverse chronological, GPA/school prominently placed, precise metrics, no color gimmicks.",
    headerBg: "#ffffff", headerText: "#000000", headerSubtext: "#333333", headerAccent: "#6699CC",
    bodyBg: "#ffffff", textPrimary: "#000000", textSecondary: "#1a1a1a", textMuted: "#666666",
    sectionTitle: "#000000", sectionBorderColor: "#000000", sectionBorderStyle: "bottom-line",
    sidebarBg: "#f7f7f7", sidebarText: "#000000", sidebarMuted: "#666666", sidebarAccent: "#6699CC",
    tagBg: "#f0f0f0", tagColor: "#333333", tagBorder: "#cccccc",
    skillBarTrack: "#e0e0e0", skillBarFill: "#6699CC",
    dividerColor: "#cccccc", fontFamily: "'Times New Roman', Georgia, serif", headingFamily: "'Times New Roman', Georgia, serif", accentDot: "#6699CC",
  },
  // ── Spotify ─ Green & modern music-tech
  {
    id: "company-spotify", name: "Spotify Style", emoji: "🎵", desc: "Green & dark, creative tech",
    layout: "sidebar",
    isCompanyTemplate: true, companyId: "spotify", companyName: "Spotify",
    companyColor: "#1DB954", companyHint: "Creative engineering meets data. Show impact at scale. Agile, curious, and mission-driven tone preferred.",
    headerBg: "#191414", headerText: "#ffffff", headerSubtext: "#1DB954", headerAccent: "#1DB954",
    bodyBg: "#ffffff", textPrimary: "#191414", textSecondary: "#333333", textMuted: "#777777",
    sectionTitle: "#1DB954", sectionBorderColor: "#1DB954", sectionBorderStyle: "left-bar",
    sidebarBg: "#191414", sidebarText: "#ffffff", sidebarMuted: "#aaaaaa", sidebarAccent: "#1DB954",
    tagBg: "#e6f9ee", tagColor: "#117a35", tagBorder: "#1DB954",
    skillBarTrack: "#282828", skillBarFill: "#1DB954",
    dividerColor: "#e0e0e0", fontFamily: "Circular, Arial, sans-serif", headingFamily: "Circular, Arial, sans-serif", accentDot: "#1DB954",
  },
  // ── Deloitte ─ Professional services
  {
    id: "company-deloitte", name: "Deloitte Style", emoji: "💼", desc: "Professional services, formal green",
    layout: "single",
    isCompanyTemplate: true, companyId: "deloitte", companyName: "Deloitte",
    companyColor: "#86BC25", companyHint: "Big 4 consulting: metrics-driven bullets, leadership roles, certifications prominently displayed.",
    headerBg: "#012169", headerText: "#ffffff", headerSubtext: "#86BC25", headerAccent: "#86BC25",
    bodyBg: "#ffffff", textPrimary: "#1a1a1a", textSecondary: "#333333", textMuted: "#666666",
    sectionTitle: "#012169", sectionBorderColor: "#86BC25", sectionBorderStyle: "left-bar",
    sidebarBg: "#f5f8ee", sidebarText: "#1a1a1a", sidebarMuted: "#666666", sidebarAccent: "#012169",
    tagBg: "#eef5d6", tagColor: "#3d6b00", tagBorder: "#86BC25",
    skillBarTrack: "#e0ecb8", skillBarFill: "#86BC25",
    dividerColor: "#dde8b5", fontFamily: "Arial, sans-serif", headingFamily: "Arial, sans-serif", accentDot: "#86BC25",
  },
];

export const COMPANY_INFO: CompanyInfo[] = [
  { id: "google", name: "Google", color: "#4285F4", bgColor: "#e8f0fe", category: "Big Tech", hint: "ATS-friendly, clean & structured", templateId: "company-google" },
  { id: "amazon", name: "Amazon", color: "#FF9900", bgColor: "#fff8ee", category: "Big Tech", hint: "STAR method, impact bullets", templateId: "company-amazon" },
  { id: "microsoft", name: "Microsoft", color: "#00A4EF", bgColor: "#deecf9", category: "Big Tech", hint: "Structured, professional blue", templateId: "company-microsoft" },
  { id: "meta", name: "Meta", color: "#0866FF", bgColor: "#e7f3ff", category: "Big Tech", hint: "Bold, modern & impact-focused", templateId: "company-meta" },
  { id: "apple", name: "Apple", color: "#000000", bgColor: "#f5f5f7", category: "Big Tech", hint: "Ultra minimal, typography-first", templateId: "company-apple" },
  { id: "netflix", name: "Netflix", color: "#E50914", bgColor: "#2d1a1a", category: "Big Tech", hint: "Bold red & dark, ownership focus", templateId: "company-netflix" },
  { id: "uber", name: "Uber", color: "#000000", bgColor: "#f0f0f0", category: "Big Tech", hint: "Monochrome bold, impact-focused", templateId: "company-uber" },
  { id: "airbnb", name: "Airbnb", color: "#FF5A5F", bgColor: "#ffe4e5", category: "Startup/Tech", hint: "Warm coral, creative collaboration", templateId: "company-airbnb" },
  { id: "spotify", name: "Spotify", color: "#1DB954", bgColor: "#e6f9ee", category: "Startup/Tech", hint: "Green & dark, creative tech", templateId: "company-spotify" },
  { id: "mckinsey", name: "McKinsey", color: "#003189", bgColor: "#e6eaf5", category: "Consulting", hint: "Formal, quantified impact bullets", templateId: "company-mckinsey" },
  { id: "goldman", name: "Goldman Sachs", color: "#6699CC", bgColor: "#f0f0f0", category: "Finance", hint: "Traditional finance, precise metrics", templateId: "company-goldman" },
  { id: "deloitte", name: "Deloitte", color: "#86BC25", bgColor: "#eef5d6", category: "Consulting", hint: "Big 4, certifications & leadership", templateId: "company-deloitte" },
];
