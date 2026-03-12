"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Skill {
  id: string;
  label: string;
  value: number;
  category: string;
  icon?: string;
  order: number;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  order: number;
}

export default function SkillsAdmin() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [catModal, setCatModal] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Forms
  const emptyCat: Omit<Category, "id"> = { title: "", icon: "🛠️", color: "#7c3aed", order: 0 };
  const emptySkill: Omit<Skill, "id"> = { label: "", value: 80, category: "", icon: "", order: 0 };
  
  const [catForm, setCatForm] = useState(emptyCat);
  const [skillForm, setSkillForm] = useState(emptySkill);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/skills");
    const data = await res.json();
    if (data.success) {
      setSkills(data.data.skills || []);
      setCategories(data.data.categories || []);
      if (data.data.categories?.length > 0 && !skillForm.category) {
        setSkillForm(prev => ({ ...prev, category: data.data.categories[0].title }));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  // CATEGORY HANDLERS
  const openCatModal = (cat?: Category) => {
    setEditingCat(cat || null);
    setCatForm(cat ? { ...cat } : emptyCat);
    setCatModal(true);
  };

  const saveCategory = async () => {
    const payload = editingCat ? { ...catForm, id: editingCat.id, type: "category" } : { ...catForm, type: "category" };
    await fetch("/api/skills", { method: editingCat ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setCatModal(false);
    await fetch_();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will not delete the skills, but they will be orphaned.")) return;
    await fetch(`/api/skills?id=${id}&type=category`, { method: "DELETE" });
    await fetch_();
  };

  // SKILL HANDLERS
  const openSkillModal = (skill?: Skill) => {
    setEditingSkill(skill?.id ? skill : null);
    setSkillForm(skill ? { ...skill } : { ...emptySkill, category: categories[0]?.title || "" });
    setSkillModal(true);
  };

  const saveSkill = async () => {
    const payload = editingSkill ? { ...skillForm, id: editingSkill.id, type: "skill" } : { ...skillForm, type: "skill" };
    await fetch("/api/skills", { method: editingSkill ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSkillModal(false);
    await fetch_();
  };

  const deleteSkill = async (id: string, isProficiency: boolean) => {
    if (!confirm(`Remove this ${isProficiency ? 'Proficiency Level' : 'Tech Stack Skill'}?`)) return;
    await fetch(`/api/skills?id=${id}&type=skill`, { method: "DELETE" });
    await fetch_();
  };

  if (loading) return <div className={styles.page}><p>Loading...</p></div>;

  const stackSkills = skills.filter(s => s.category !== "Proficiency");
  const proficiencySkills = skills.filter(s => s.category === "Proficiency");

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Skills & Expertise</h1>
        <p className={styles.pageSubtitle}>Manage tech stacks and proficiency bars</p>
      </div>

      <div className={styles.formGrid}>
        
        {/* PROFICIENCIES */}
        <div className={styles.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
            <h2 className={styles.cardTitle} style={{margin:0}}>Proficiency Levels (Bars)</h2>
            <button className={styles.btnSecondary} style={{padding:"6px 12px"}} onClick={() => openSkillModal({ ...emptySkill, category: "Proficiency", value: 80 } as any)}>+ Add Bar</button>
          </div>
          <table className={styles.table}>
            <thead><tr><th>Skill Label</th><th>Value (%)</th><th>Actions</th></tr></thead>
            <tbody>
              {proficiencySkills.map((p) => (
                <tr key={p.id}>
                  <td style={{fontWeight:600}}>{p.label}</td>
                  <td>{p.value}%</td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button className={styles.btnEdit} onClick={() => openSkillModal(p)}>Edit</button>
                      <button className={styles.btnDanger} onClick={() => deleteSkill(p.id, true)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {proficiencySkills.length === 0 && <tr><td colSpan={3} className={styles.emptyState}>No proficiencies added.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* CATEGORIES */}
        <div className={styles.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
            <h2 className={styles.cardTitle} style={{margin:0}}>Tech Stack Categories</h2>
            <button className={styles.btnSecondary} style={{padding:"6px 12px"}} onClick={() => openCatModal()}>+ Add Category</button>
          </div>
          <table className={styles.table}>
            <thead><tr><th>Icon & Title</th><th>Color</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.filter(c => c.title !== "Proficiency").map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{background:`${c.color}22`, padding:4, borderRadius:4}}>{c.icon}</span>
                      <span style={{fontWeight:600}}>{c.title}</span>
                    </div>
                  </td>
                  <td><div style={{width:16,height:16,borderRadius:'50%',background:c.color}} /></td>
                  <td>{c.order}</td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button className={styles.btnEdit} onClick={() => openCatModal(c)}>Edit</button>
                      <button className={styles.btnDanger} onClick={() => deleteCategory(c.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.filter(c => c.title !== "Proficiency").length === 0 && <tr><td colSpan={4} className={styles.emptyState}>No categories added.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* TECH STACK SKILLS */}
        <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
            <h2 className={styles.cardTitle} style={{margin:0}}>Tech Stack Skills (Chips)</h2>
            <button className={styles.btnSecondary} onClick={() => openSkillModal()}>+ Add Tech Skill</button>
          </div>
          <table className={styles.table}>
            <thead><tr><th>Skill Name</th><th>Assigned Category</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {stackSkills.map((s) => (
                <tr key={s.id}>
                  <td style={{fontWeight:600}}>{s.label}</td>
                  <td><span className={styles.badge} style={{background:`rgba(124, 58, 237, 0.15)`,color:`#a78bfa`}}>{s.category}</span></td>
                  <td>{s.order}</td>
                  <td>
                    <div className={styles.btnGroup}>
                      <button className={styles.btnEdit} onClick={() => openSkillModal(s)}>Edit</button>
                      <button className={styles.btnDanger} onClick={() => deleteSkill(s.id, false)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {stackSkills.length === 0 && <tr><td colSpan={4} className={styles.emptyState}>No stack skills added.</td></tr>}
            </tbody>
          </table>
        </div>

      </div>

      {/* CATEGORY MODAL */}
      {catModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setCatModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editingCat ? "Edit Category" : "Add Category"}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title (e.g. Frontend)</label>
              <input className={styles.input} value={catForm.title} onChange={e=>setCatForm({...catForm,title:e.target.value})} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Icon (emoji)</label>
                <input className={styles.input} value={catForm.icon} onChange={e=>setCatForm({...catForm,icon:e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Theme Color</label>
                <input type="color" className={styles.input} value={catForm.color} onChange={e=>setCatForm({...catForm,color:e.target.value})} style={{padding:4,height:42}} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Display Order</label>
              <input className={styles.input} type="number" value={catForm.order} onChange={e=>setCatForm({...catForm,order:parseInt(e.target.value)||0})} />
            </div>
            <div className={styles.formActions} style={{marginTop:16}}><button className={styles.btnSecondary} onClick={()=>setCatModal(false)}>Cancel</button><button className={styles.btnPrimary} onClick={saveCategory}>Save</button></div>
          </div>
        </div>
      )}

      {/* SKILL MODAL */}
      {skillModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setSkillModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editingSkill ? "Edit Skill" : "Add Skill"}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Skill Name</label>
              <input className={styles.input} value={skillForm.label} onChange={e=>setSkillForm({...skillForm,label:e.target.value})} />
            </div>
            
            {skillForm.category !== "Proficiency" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select className={styles.select} value={skillForm.category} onChange={e=>setSkillForm({...skillForm,category:e.target.value})}>
                  {categories.filter(c => c.title !== "Proficiency").map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                </select>
              </div>
            )}

            {skillForm.category === "Proficiency" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Proficiency Percentage (0-100)</label>
                <input className={styles.input} type="number" min={0} max={100} value={skillForm.value} onChange={e=>setSkillForm({...skillForm,value:parseInt(e.target.value)||0})} />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Display Order</label>
              <input className={styles.input} type="number" value={skillForm.order} onChange={e=>setSkillForm({...skillForm,order:parseInt(e.target.value)||0})} />
            </div>
            <div className={styles.formActions} style={{marginTop:16}}><button className={styles.btnSecondary} onClick={()=>setSkillModal(false)}>Cancel</button><button className={styles.btnPrimary} onClick={saveSkill}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
