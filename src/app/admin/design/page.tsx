"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";

// ── Preset Themes ─────────────────────────────────────────────────────────────

const PRESETS = [
  {
    name: "Violet Dream",
    emoji: "🔮",
    colors: { colorPrimary: "#7c3aed", colorSecondary: "#06b6d4", colorPink: "#ec4899", bgPrimary: "#050816", bgSecondary: "#0d1117" },
  },
  {
    name: "Ocean Blue",
    emoji: "🌊",
    colors: { colorPrimary: "#2563eb", colorSecondary: "#06b6d4", colorPink: "#7c3aed", bgPrimary: "#030d1a", bgSecondary: "#060f1f" },
  },
  {
    name: "Emerald",
    emoji: "🌿",
    colors: { colorPrimary: "#10b981", colorSecondary: "#06b6d4", colorPink: "#3b82f6", bgPrimary: "#030f0a", bgSecondary: "#041510" },
  },
  {
    name: "Rose Gold",
    emoji: "🌸",
    colors: { colorPrimary: "#ec4899", colorSecondary: "#f59e0b", colorPink: "#8b5cf6", bgPrimary: "#0f050a", bgSecondary: "#1a0810" },
  },
  {
    name: "Cyberpunk",
    emoji: "⚡",
    colors: { colorPrimary: "#facc15", colorSecondary: "#ec4899", colorPink: "#06b6d4", bgPrimary: "#050005", bgSecondary: "#0a000f" },
  },
  {
    name: "Midnight",
    emoji: "🌙",
    colors: { colorPrimary: "#6366f1", colorSecondary: "#a78bfa", colorPink: "#f472b6", bgPrimary: "#02020a", bgSecondary: "#060614" },
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DesignForm {
  colorPrimary: string;
  colorSecondary: string;
  colorPink: string;
  bgPrimary: string;
  bgSecondary: string;
  fontBody: string;
  animationLevel: string;
  borderRadius: string;
  showSkills: boolean;
  showProjects: boolean;
  showExperience: boolean;
  showEvents: boolean;
}

const DEFAULTS: DesignForm = {
  colorPrimary:   "#7c3aed",
  colorSecondary: "#06b6d4",
  colorPink:      "#ec4899",
  bgPrimary:      "#050816",
  bgSecondary:    "#0d1117",
  fontBody:       "Inter",
  animationLevel: "normal",
  borderRadius:   "medium",
  showSkills:     true,
  showProjects:   true,
  showExperience: true,
  showEvents:     true,
};

const GET_DESIGN = `
  query GetDesign($username: String!) {
    getPortfolio(username: $username) {
      siteSettings {
        colorPrimary colorSecondary colorPink bgPrimary bgSecondary
        fontBody animationLevel borderRadius
        showSkills showProjects showExperience showEvents
      }
    }
  }
`;

const SAVE_DESIGN = `
  mutation SaveSettings($userId: ID!, $input: SiteSettingsInput!) {
    saveSiteSettings(userId: $userId, input: $input) { id }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ColorSwatch({ label, field, value, onChange }: { label: string; field: keyof DesignForm; value: string; onChange: (f: keyof DesignForm, v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(field, e.target.value)}
          style={{ width: 44, height: 44, padding: 2, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer" }}
        />
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(field, e.target.value); }}
          style={{ width: 90, fontFamily: "monospace", fontSize: "0.85rem", padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f8fafc" }}
        />
        <div style={{ width: 28, height: 28, borderRadius: 6, background: value, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

function ToggleSection({ label, field, checked, onChange }: { label: string; field: keyof DesignForm; checked: boolean; onChange: (f: keyof DesignForm, v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
      <span style={{ fontSize: "0.9rem", color: "#e2e8f0", fontWeight: 500 }}>{label}</span>
      <div
        onClick={() => onChange(field, !checked)}
        style={{
          width: 44, height: 24, borderRadius: 100, position: "relative", flexShrink: 0,
          background: checked ? "var(--accent-primary, #7c3aed)" : "rgba(255,255,255,0.1)",
          transition: "background 0.2s",
          cursor: "pointer",
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
        }} />
      </div>
    </label>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DesignStudio() {
  const { data: session } = useSession();
  const userId   = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const [form, setForm]       = useState<DesignForm>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const data = await graphqlClient.query(GET_DESIGN, { username });
      const raw = data?.getPortfolio?.siteSettings;
      if (raw) {
        setForm({
          colorPrimary:   raw.colorPrimary   || DEFAULTS.colorPrimary,
          colorSecondary: raw.colorSecondary || DEFAULTS.colorSecondary,
          colorPink:      raw.colorPink      || DEFAULTS.colorPink,
          bgPrimary:      raw.bgPrimary      || DEFAULTS.bgPrimary,
          bgSecondary:    raw.bgSecondary    || DEFAULTS.bgSecondary,
          fontBody:       raw.fontBody       || DEFAULTS.fontBody,
          animationLevel: raw.animationLevel || DEFAULTS.animationLevel,
          borderRadius:   raw.borderRadius   || DEFAULTS.borderRadius,
          showSkills:     raw.showSkills     !== false,
          showProjects:   raw.showProjects   !== false,
          showExperience: raw.showExperience !== false,
          showEvents:     raw.showEvents     !== false,
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [username]);

  useEffect(() => { load(); }, [load]);

  const update = (field: keyof DesignForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  const applyPreset = (preset: typeof PRESETS[0]) => setForm(f => ({ ...f, ...preset.colors }));

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await graphqlClient.query(SAVE_DESIGN, { userId, input: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const resetToDefaults = () => setForm(DEFAULTS);

  if (loading) return <div className={styles.loading}>Loading design settings...</div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className={styles.pageTitle}>Design Studio</h1>
          <p className={styles.pageSubtitle}>Customize colours, fonts, animations, and section visibility for your portfolio</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={styles.btnSecondary} onClick={resetToDefaults}>↺ Reset Defaults</button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Design"}
          </button>
        </div>
      </div>

      {/* Preset Themes */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Theme Presets</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          Pick a preset to instantly apply a colour scheme, then fine-tune below.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              style={{
                padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: `linear-gradient(135deg, ${p.colors.bgSecondary} 0%, ${p.colors.bgPrimary} 100%)`,
                border: `1px solid ${p.colors.colorPrimary}44`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {[p.colors.colorPrimary, p.colors.colorSecondary, p.colors.colorPink].map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: p.colors.colorPrimary }}>{p.emoji} {p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Accent Colours</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          These are the primary, secondary, and highlight colours used throughout buttons, gradients, and glows.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          <ColorSwatch label="Primary (purple/violet)" field="colorPrimary" value={form.colorPrimary} onChange={update} />
          <ColorSwatch label="Secondary (cyan/blue)" field="colorSecondary" value={form.colorSecondary} onChange={update} />
          <ColorSwatch label="Highlight (pink/rose)" field="colorPink" value={form.colorPink} onChange={update} />
        </div>
      </div>

      {/* Background Colors */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Background Colours</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          Keep these very dark for the best contrast. Lighter backgrounds will reduce text readability.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          <ColorSwatch label="Page Background" field="bgPrimary" value={form.bgPrimary} onChange={update} />
          <ColorSwatch label="Card / Panel Background" field="bgSecondary" value={form.bgSecondary} onChange={update} />
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: form.bgPrimary, border: `1px solid ${form.colorPrimary}44`, fontSize: "0.82rem", color: form.colorSecondary }}>
          Preview: background with <span style={{ color: form.colorPrimary, fontWeight: 700 }}>primary</span> and <span style={{ color: form.colorPink }}>highlight</span> colours
        </div>
      </div>

      {/* Typography */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Typography</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Body Font</label>
            <select
              className={styles.input}
              value={form.fontBody}
              onChange={e => update("fontBody", e.target.value)}
            >
              {["Inter", "Poppins", "Space Grotesk", "Raleway", "DM Sans"].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 6 }}>
              Note: Google Fonts for Poppins, Space Grotesk, Raleway, and DM Sans are loaded on demand.
            </p>
          </div>
        </div>
      </div>

      {/* Animations & Style */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Animation & Style</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Animation Level</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { value: "none",    label: "None",    desc: "No motion" },
                { value: "subtle",  label: "Subtle",  desc: "Gentle fades" },
                { value: "normal",  label: "Normal",  desc: "Default feel" },
                { value: "dynamic", label: "Dynamic", desc: "Bold & bouncy" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update("animationLevel", opt.value)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, textAlign: "left",
                    background: form.animationLevel === opt.value ? `${form.colorPrimary}22` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${form.animationLevel === opt.value ? form.colorPrimary : "rgba(255,255,255,0.08)"}`,
                    color: form.animationLevel === opt.value ? form.colorPrimary : "#94a3b8",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Corner Radius</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { value: "sharp",   label: "Sharp",   preview: 4,  desc: "Angular, technical" },
                { value: "medium",  label: "Medium",  preview: 12, desc: "Balanced default" },
                { value: "rounded", label: "Rounded", preview: 24, desc: "Soft, friendly" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update("borderRadius", opt.value)}
                  style={{
                    padding: "10px 14px", borderRadius: opt.preview, textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12,
                    background: form.borderRadius === opt.value ? `${form.colorPrimary}22` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${form.borderRadius === opt.value ? form.colorPrimary : "rgba(255,255,255,0.08)"}`,
                    color: form.borderRadius === opt.value ? form.colorPrimary : "#94a3b8",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: opt.preview, background: form.borderRadius === opt.value ? form.colorPrimary : "#334155", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{opt.label}</div>
                    <div style={{ fontSize: "0.72rem", opacity: 0.7 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section Visibility */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Section Visibility</h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
          Toggle which sections appear on your public portfolio. Hidden sections are completely removed from the page.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <ToggleSection label="Skills Section"      field="showSkills"     checked={form.showSkills}     onChange={update} />
          <ToggleSection label="Projects Section"    field="showProjects"   checked={form.showProjects}   onChange={update} />
          <ToggleSection label="Experience Section"  field="showExperience" checked={form.showExperience} onChange={update} />
          <ToggleSection label="Events Section"      field="showEvents"     checked={form.showEvents}     onChange={update} />
        </div>
        <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: 12 }}>
          Note: Hero, About, and Contact sections are always visible.
        </p>
      </div>

      {/* Save footer */}
      <button
        className={styles.btnPrimary}
        style={{ width: "100%", padding: "16px", fontSize: "1.05rem" }}
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? "Saving Changes..." : saved ? "✓ Design Saved!" : "Save All Design Settings"}
      </button>
    </div>
  );
}
