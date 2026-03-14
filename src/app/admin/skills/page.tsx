"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";

interface Skill { id: string; label: string; value: number; category: string; icon?: string; order: number; }
interface Category { id: string; title: string; icon: string; color: string; order: number; }

const GET_SKILLS_AND_CATS = `
  query GetSkillsAndCats($username: String!, $search: String, $category: String, $sortBy: String, $sortOrder: String, $page: Int, $limit: Int) {
    getSkills(username: $username, search: $search, category: $category, sortBy: $sortBy, sortOrder: $sortOrder, page: $page, limit: $limit) {
      items { id label value category icon order }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const UPSERT_SKILL = `
  mutation UpsertSkill($userId: ID!, $input: SkillInput!) {
    upsertSkill(userId: $userId, input: $input) { id }
  }
`;

const DELETE_SKILL = `
  mutation DeleteSkill($id: ID!) {
    deleteSkill(id: $id)
  }
`;

export default function SkillsAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 20;

  const [skillModal, setSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const emptySkill: Omit<Skill, "id"> = { label: "", value: 80, category: "Frontend", icon: "", order: 0 };
  const [skillForm, setSkillForm] = useState(emptySkill);

  const fetch_ = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const data = await graphqlClient.query(GET_SKILLS_AND_CATS, { username, search: search || undefined, category: filterCategory || undefined, sortBy, sortOrder, page, limit });
      const items = data?.getSkills?.items || [];
      setSkills(items);
      setPageInfo(data?.getSkills?.pageInfo || null);
      const dynamicCats = Array.from(new Set(items.map((s: any) => s.category)))
        .map(c => ({ id: c as string, title: c as string, icon: "🛠️", color: "#7c3aed", order: 0 }));
      setCategories(dynamicCats);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
    setLoading(false);
  }, [username, search, filterCategory, sortBy, sortOrder, page]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [search, filterCategory, sortBy, sortOrder]);

  const openSkillModal = (skill?: Skill) => {
    setEditingSkill(skill?.id ? skill : null);
    setSkillForm(skill ? { ...skill } : { ...emptySkill });
    setSkillModal(true);
  };

  const saveSkill = async () => {
    if (!userId) return;
    try {
      const { ...input } = skillForm;
      await graphqlClient.query(UPSERT_SKILL, { userId, input });
      setSkillModal(false);
      await fetch_();
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm(`Remove this skill?`)) return;
    try {
      await graphqlClient.query(DELETE_SKILL, { id });
      await fetch_();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
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
                      <button className={styles.btnDanger} onClick={() => deleteSkill(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {proficiencySkills.length === 0 && <tr><td colSpan={3} className={styles.emptyState}>No proficiencies added.</td></tr>}
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
                      <button className={styles.btnDanger} onClick={() => deleteSkill(s.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {stackSkills.length === 0 && <tr><td colSpan={4} className={styles.emptyState}>No stack skills added.</td></tr>}
            </tbody>
          </table>
        </div>

      </div>

      {/* SKILL MODAL */}
      {skillModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setSkillModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editingSkill ? "Edit Skill" : "Add Skill"}</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Skill Name</label>
              <input className={styles.input} value={skillForm.label} onChange={e=>setSkillForm({...skillForm,label:e.target.value})} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select className={styles.select} value={skillForm.category} onChange={e=>setSkillForm({...skillForm,category:e.target.value})}>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI/ML">AI/ML</option>
                <option value="DevOps">DevOps</option>
                <option value="Proficiency">Proficiency (Bar)</option>
              </select>
            </div>

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
