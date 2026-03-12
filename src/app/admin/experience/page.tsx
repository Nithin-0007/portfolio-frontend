"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  type: string;
  icon: string;
  color: string;
  points: string[];
  order: number;
}

const empty: Omit<Experience, "id"> = {
  role: "",
  company: "",
  period: "",
  type: "EXPERIENCE",
  icon: "💼",
  color: "#7c3aed",
  points: [""],
  order: 0,
};

const TYPES = ["EXPERIENCE", "EDUCATION"];

export default function ExperienceAdmin() {
  const [items, setItems] = useState<Experience[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/experience");
    const data = await res.json();
    setItems(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (exp?: Experience) => {
    setEditing(exp || null);
    setForm(exp ? { ...exp } : empty);
    setModal(true);
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...form.points];
    newPoints[index] = value;
    setForm({ ...form, points: newPoints });
  };

  const addPoint = () => setForm({ ...form, points: [...form.points, ""] });
  const removePoint = (index: number) => {
    setForm({ ...form, points: form.points.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    
    // Filter out empy strings in points just in case
    body.points = body.points.filter((p) => p.trim() !== "");

    await fetch("/api/experience", { 
      method, 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(body) 
    });
    
    setModal(false);
    await fetch_();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience record?")) return;
    await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
    await fetch_();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Experience & Education</h1>
        <p className={styles.pageSubtitle}>Manage your resume points across experience and education</p>
      </div>
      
      <div className={styles.tableHeader}>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{items.length} records found</span>
        <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Add Record</button>
      </div>
      
      <table className={styles.table}>
        <thead><tr>
          <th>Role / Degree</th><th>Company / Institution</th><th>Period</th><th>Type</th><th>Order</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{ fontSize: '1.2rem', color: item.color }}>{item.icon}</span>
                  <div>
                    <div style={{color:"#f8fafc",fontWeight:600}}>{item.role}</div>
                    <div style={{fontSize:"0.75rem",color:"#475569"}}>{item.points.length} points</div>
                  </div>
                </div>
              </td>
              <td><div style={{fontWeight:500}}>{item.company}</div></td>
              <td style={{fontSize:"0.85rem"}}>{item.period}</td>
              <td>
                <span className={`${styles.badge} ${item.type === 'EXPERIENCE' ? styles.badgePurple : styles.badgeBlue}`}>
                  {item.type}
                </span>
              </td>
              <td style={{ textAlign: "center" }}>{item.order}</td>
              <td>
                <div className={styles.btnGroup}>
                  <button className={styles.btnEdit} onClick={() => openModal(item)}>Edit</button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>💼</div><div className={styles.emptyText}>No experience added yet. Add your first career milestone!</div></div></td></tr>}
        </tbody>
      </table>

      {modal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editing ? "Edit Record" : "Add Record"}</h3>
            <div className={styles.formGrid}>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role / Degree Title</label>
                  <input className={styles.input} value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="e.g. Senior Frontend Developer"/>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Type</label>
                  <select className={styles.select} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company / University</label>
                  <input className={styles.input} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="e.g. Tech Corp Inc"/>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Period</label>
                  <input className={styles.input} value={form.period} onChange={e=>setForm({...form,period:e.target.value})} placeholder="e.g. 2021 - Present"/>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Icon (emoji)</label>
                  <input className={styles.input} value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}/>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Accent Color</label>
                  <input type="color" className={styles.input} value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{padding:4,height:42}}/>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Resume Points</label>
                {form.points.map((point, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input className={styles.input} style={{ flex: 1 }} value={point} onChange={(e) => handlePointChange(i, e.target.value)} placeholder="Led a team of 5 engineers to deliver..." />
                    <button className={styles.btnDanger} onClick={() => removePoint(i)}>Remove</button>
                  </div>
                ))}
                <button className={styles.btnSecondary} onClick={addPoint} style={{ width: 'fit-content', marginTop: 4 }}>+ Add Point</button>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Order</label>
                <input className={styles.input} type="number" value={form.order} onChange={e=>setForm({...form,order:parseInt(e.target.value)||0})}/>
              </div>

              <div className={styles.formActions} style={{ marginTop: 16 }}>
                <button className={styles.btnSecondary} onClick={() => setModal(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Record"}</button>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
