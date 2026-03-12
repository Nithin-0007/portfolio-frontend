"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Project { id: string; title: string; description: string; tags: string[]; category: string; icon: string; color: string; github?: string; live?: string; featured: boolean; published: boolean; }

const empty: Omit<Project, "id"> = { title: "", description: "", tags: [], category: "Web App", icon: "💼", color: "#7c3aed", github: "", live: "", featured: false, published: true };
const CATEGORIES = ["Web App", "Full-Stack", "AI/ML", "Mobile", "Tool", "Other"];

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (p?: Project) => {
    setEditing(p || null);
    setForm(p ? { ...p } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/projects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setModal(false);
    await fetch_();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    await fetch_();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Projects</h1>
        <p className={styles.pageSubtitle}>Manage your portfolio projects</p>
      </div>
      <div className={styles.tableHeader}>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{projects.length} projects</span>
        <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Add Project</button>
      </div>
      <table className={styles.table}>
        <thead><tr>
          <th>Project</th><th>Category</th><th>Tags</th><th>Featured</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td><div style={{display:"flex",alignItems:"center",gap:10}}><span>{p.icon}</span><div><div style={{color:"#f8fafc",fontWeight:600}}>{p.title}</div><div style={{fontSize:"0.75rem",color:"#475569",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.description}</div></div></div></td>
              <td><span className={`${styles.badge} ${styles.badgePurple}`}>{p.category}</span></td>
              <td style={{fontSize:"0.75rem"}}>{p.tags.slice(0,3).join(", ")}{p.tags.length > 3 ? "..." : ""}</td>
              <td>{p.featured ? "⭐" : "—"}</td>
              <td><span className={`${styles.badge} ${p.published ? styles.badgeGreen : styles.badgeGray}`}>{p.published ? "Published" : "Draft"}</span></td>
              <td><div className={styles.btnGroup}><button className={styles.btnEdit} onClick={() => openModal(p)}>Edit</button><button className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Delete</button></div></td>
            </tr>
          ))}
          {projects.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>💼</div><div className={styles.emptyText}>No projects yet. Add your first one!</div></div></td></tr>}
        </tbody>
      </table>

      {modal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editing ? "Edit Project" : "Add Project"}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label className={styles.label}>Title</label><input className={styles.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Project Title"/></div>
                <div className={styles.formGroup}><label className={styles.label}>Category</label><select className={styles.select} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short description..."/></div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label className={styles.label}>Icon (emoji)</label><input className={styles.input} value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Color</label><input type="color" className={styles.input} value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{padding:4,height:42}}/></div>
              </div>
              <div className={styles.formGroup}><label className={styles.label}>Tags (comma-separated)</label><input className={styles.input} value={form.tags.join(", ")} onChange={e=>setForm({...form,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})} placeholder="React, TypeScript, Node.js"/></div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label className={styles.label}>GitHub URL</label><input className={styles.input} value={form.github||""} onChange={e=>setForm({...form,github:e.target.value})} placeholder="https://github.com/..."/></div>
                <div className={styles.formGroup}><label className={styles.label}>Live URL</label><input className={styles.input} value={form.live||""} onChange={e=>setForm({...form,live:e.target.value})} placeholder="https://..."/></div>
              </div>
              <div style={{display:"flex",gap:16}}>
                <label className={styles.checkbox}><input type="checkbox" className={styles.checkboxInput} checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label>
                <label className={styles.checkbox}><input type="checkbox" className={styles.checkboxInput} checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Published</label>
              </div>
              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={() => setModal(false)}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Project"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
