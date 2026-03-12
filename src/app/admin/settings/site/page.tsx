"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../../admin-pages.module.css";

interface SiteSettings {
  id?: string;
  heroTagline: string;
  footerText: string;
  heroStats: { value: string; label: string }[];
  quickLinks: { label: string; href: string }[];
}

export default function SiteSettingsAdmin() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings/site");
    const data = await res.json();
    if (data.success) {
      setForm(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    
    // Filter out empties safely
    const cleanForm = {
      ...form,
      heroStats: form.heroStats.filter(s => s.value.trim() && s.label.trim()),
      quickLinks: form.quickLinks.filter(l => l.label.trim() && l.href.trim()),
    };

    await fetch("/api/settings/site", { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(cleanForm) 
    });
    
    await fetch_();
    setSaving(false);
    alert("Site Settings saved successfully!");
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
        <h2 className={styles.cardTitle}>Hero Statistics Grid</h2>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>Configure the 3 key metric cards displayed on the Hero Home page.</p>
        
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
            <button className={styles.btnDanger} style={{ height: "fit-content", marginTop: 26 }} onClick={() => removeStat(i)}>X</button>
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

      <button className={styles.btnPrimary} style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} disabled={saving} onClick={handleSave}>
        {saving ? "Saving Changes..." : "Save All Site Settings"}
      </button>

    </div>
  );
}
