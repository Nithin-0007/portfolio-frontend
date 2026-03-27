"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";

interface SiteSettings {
  id?: string;
  heroTagline: string;
  footerText: string;
  heroStats: { value: string; label: string }[];
  quickLinks: { label: string; href: string }[];
  contactSubtitle: string;
  contactLocation: string;
  contactEmail: string;
  contactPhone: string;
  contactAvailability: string;
}

const GET_SETTINGS = `
  query GetSettings($username: String!) {
    getPortfolio(username: $username) {
      siteSettings {
        heroTagline footerText heroStats quickLinks
        contactSubtitle contactLocation contactEmail contactPhone contactAvailability
      }
    }
  }
`;

const SAVE_SETTINGS = `
  mutation SaveSettings($userId: ID!, $input: SiteSettingsInput!) {
    saveSiteSettings(userId: $userId, input: $input) { id }
  }
`;

export default function SiteSettingsAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const data = await graphqlClient.query(GET_SETTINGS, { username });
      const raw = data?.getPortfolio?.siteSettings;
      if (raw) {
        setForm({
          ...raw,
          heroStats: raw.heroStats?.map((s: string) => {
            const [value, label] = s.split("|");
            return { value: value || "", label: label || "" };
          }) || [],
          quickLinks: raw.quickLinks?.map((l: string) => {
            const [label, href] = l.split("|");
            return { label: label || "", href: href || "" };
          }) || [],
          contactSubtitle: raw.contactSubtitle || "",
          contactLocation: raw.contactLocation || "",
          contactEmail: raw.contactEmail || "",
          contactPhone: raw.contactPhone || "",
          contactAvailability: raw.contactAvailability || "",
        });
      } else {
        setForm({ heroTagline: "", footerText: "", heroStats: [], quickLinks: [], contactSubtitle: "", contactLocation: "", contactEmail: "", contactPhone: "", contactAvailability: "" });
      }
    } catch (error) {
       console.error("Error fetching settings:", error);
    }
    setLoading(false);
  }, [username]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSave = async () => {
    if (!form || !userId) return;
    setSaving(true);
    try {
      // Convert objects back to pipe-separated strings for backend
      const cleanInput = {
        heroTagline: form.heroTagline,
        footerText: form.footerText,
        heroStats: form.heroStats.filter(s => s.value.trim() && s.label.trim()).map(s => `${s.value}|${s.label}`),
        quickLinks: form.quickLinks.filter(l => l.label.trim() && l.href.trim()).map(l => `${l.label}|${l.href}`),
        contactSubtitle: form.contactSubtitle,
        contactLocation: form.contactLocation,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        contactAvailability: form.contactAvailability,
      };

      await graphqlClient.query(SAVE_SETTINGS, { userId, input: cleanInput });
      await fetch_();
      alert("Site Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => { if(form) setForm({ ...form, heroStats: [...form.heroStats, { value: "", label: "" }] }) };
  const removeStat = (i: number) => { if (form) setForm({ ...form, heroStats: form.heroStats.filter((_, idx) => idx !== i) }) };
  const updateStat = (i: number, key: 'value'|'label', val: string) => {
    if(!form) return;
    const s = [...form.heroStats];
    s[i][key] = val;
    setForm({...form, heroStats: s});
  };

  const addLink = () => { if(form) setForm({ ...form, quickLinks: [...form.quickLinks, { label: "", href: "" }] }) };
  const removeLink = (i: number) => { if (form) setForm({ ...form, quickLinks: form.quickLinks.filter((_, idx) => idx !== i) }) };
  const updateLink = (i: number, key: 'label'|'href', val: string) => {
    if(!form) return;
    const s = [...form.quickLinks];
    s[i][key] = val;
    setForm({...form, quickLinks: s});
  };

  if (loading) return <div className={styles.page}><p>Loading settings...</p></div>;
  if (!form) return <div className={styles.page}><p>Failed to load settings.</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Site Settings</h1>
        <p className={styles.pageSubtitle}>Manage global footer text, hero statistics, and quick links</p>
      </div>

      <div className={styles.card} style={{ marginBottom: "2rem" }}>
        <h2 className={styles.cardTitle}>Global Text</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Hero Sub-Tagline</label>
          <input className={styles.input} value={form.heroTagline} onChange={e => setForm({...form, heroTagline: e.target.value})} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Footer Copyright Text</label>
          <input className={styles.input} value={form.footerText} onChange={e => setForm({...form, footerText: e.target.value})} />
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <div>
            <h2 className={styles.cardTitle} style={{ marginBottom: 4 }}>Hero Statistics Grid</h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              The stat numbers shown at the bottom of your Hero section (e.g. &quot;25+ Projects Shipped&quot;).
            </p>
          </div>
          {form.heroStats.length === 0 && (
            <button
              className={styles.btnSecondary}
              style={{ fontSize: "0.78rem", padding: "6px 14px", flexShrink: 0 }}
              onClick={() => setForm(f => f ? { ...f, heroStats: [
                { value: "25+", label: "Projects Shipped" },
                { value: "3+", label: "Years Experience" },
                { value: "10k+", label: "Lines of Code" },
              ]} : f)}
            >
              + Quick Add Defaults
            </button>
          )}
        </div>

        {form.heroStats.length === 0 && (
          <div style={{ padding: "16px", background: "rgba(124,58,237,0.08)", border: "1px dashed rgba(124,58,237,0.3)", borderRadius: "10px", marginBottom: "16px", fontSize: "0.82rem", color: "#94a3b8" }}>
            No stats yet. Click <strong>+ Add Statistic</strong> below or <strong>Quick Add Defaults</strong> to add example stats, then edit with your real numbers.
          </div>
        )}

        {form.heroStats.map((stat, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 12, marginBottom: 16 }}>
            <div>
              <label className={styles.label}>Number Value</label>
              <input className={styles.input} value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="e.g. 25+" />
            </div>
            <div>
              <label className={styles.label}>Stat Label</label>
              <input className={styles.input} value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="e.g. Projects Shipped" />
            </div>
            <button className={styles.btnDanger} style={{ height: "fit-content", marginTop: 26 }} onClick={() => removeStat(i)}>✕</button>
          </div>
        ))}
        <button className={styles.btnSecondary} onClick={addStat}>+ Add Statistic</button>
      </div>

      <div className={styles.card} style={{ marginBottom: "2rem" }}>
        <h2 className={styles.cardTitle}>Footer Quick Links</h2>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>Configure the navigation shortcuts in the Footer.</p>
        
        {form.quickLinks.map((link, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 16 }}>
            <div>
              <label className={styles.label}>Link Name</label>
              <input className={styles.input} value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} placeholder="e.g. Skills" />
            </div>
            <div>
              <label className={styles.label}>URL / Section ID</label>
              <input className={styles.input} value={link.href} onChange={e => updateLink(i, 'href', e.target.value)} placeholder="e.g. #skills or /page" />
            </div>
            <button className={styles.btnDanger} style={{ height: "fit-content", marginTop: 26 }} onClick={() => removeLink(i)}>X</button>
          </div>
        ))}
        <button className={styles.btnSecondary} onClick={addLink}>+ Add Quick Link</button>
      </div>

      <div className={styles.card} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Contact Section</h2>
          <button
            className={styles.btnSecondary}
            style={{ fontSize: "0.78rem", padding: "6px 14px" }}
            onClick={() => setForm(f => f ? { ...f, contactLocation: "", contactEmail: "", contactPhone: "", contactAvailability: "", contactSubtitle: "" } : f)}
            title="Clear all contact override fields (portfolio will fall back to your account data)"
          >
            🗑 Clear All
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
          Controls the Contact page info panel. Leave fields <strong>empty</strong> to automatically use data from &quot;Profile Content → Contact Information&quot;. Email always falls back to your account email.
        </p>
        <div className={styles.formGroup}>
          <label className={styles.label}>Contact Subtitle</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.contactSubtitle}
            onChange={e => setForm({ ...form, contactSubtitle: e.target.value })}
            placeholder="Whether you need a full-stack web application..."
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>📍 Location</label>
            <input className={styles.input} value={form.contactLocation} onChange={e => setForm({ ...form, contactLocation: e.target.value })} placeholder="Chennai, Tamil Nadu, India" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>🕐 Availability</label>
            <input className={styles.input} value={form.contactAvailability} onChange={e => setForm({ ...form, contactAvailability: e.target.value })} placeholder="Open to opportunities" />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>📧 Contact Email</label>
            <input type="email" className={styles.input} value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="admin@nithish.dev" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>📱 Contact Phone</label>
            <input className={styles.input} value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
        </div>
      </div>

      <button className={styles.btnPrimary} style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} disabled={saving} onClick={handleSave}>
        {saving ? "Saving Changes..." : "Save All Site Settings"}
      </button>

    </div>
  );
}
