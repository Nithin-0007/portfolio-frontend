"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Achievement {
  id: string;
  title: string;
  order: number;
}

const empty: Omit<Achievement, "id"> = { title: "", order: 0 };

export default function AchievementsAdmin() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/achievements");
    const data = await res.json();
    setItems(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (item?: Achievement) => {
    setEditing(item || null);
    setForm(item ? { ...item } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    
    await fetch("/api/achievements", { 
      method, 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(body) 
    });
    
    setModal(false);
    await fetch_();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    await fetch(`/api/achievements?id=${id}`, { method: "DELETE" });
    await fetch_();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Achievements</h1>
        <p className={styles.pageSubtitle}>Manage your timeline achievements</p>
      </div>
      
      <div className={styles.tableHeader}>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{items.length} achievements found</span>
        <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Add Achievement</button>
      </div>
      
      <table className={styles.table}>
        <thead><tr>
          <th>Achievement Title</th><th>Order</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><div style={{color:"#f8fafc",fontWeight:600}}>{item.title}</div></td>
              <td>{item.order}</td>
              <td>
                <div className={styles.btnGroup}>
                  <button className={styles.btnEdit} onClick={() => openModal(item)}>Edit</button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3}><div className={styles.emptyState}><div className={styles.emptyIcon}>🏆</div><div className={styles.emptyText}>No achievements added yet. Add your first career milestone!</div></div></td></tr>}
        </tbody>
      </table>

      {modal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editing ? "Edit Record" : "Add Record"}</h3>
            <div className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Achievement Title</label>
                <input className={styles.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Hackathon Winner 2023"/>
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
