"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { useDebounce } from "@/lib/useDebounce";
import { useConfirm } from "../components/ConfirmDialog";

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

const GET_EXPERIENCES = `
  query GetExperiences($username: String!, $page: Int, $limit: Int, $search: String, $type: String, $sortBy: String, $sortOrder: String) {
    getExperiences(username: $username, page: $page, limit: $limit, search: $search, type: $type, sortBy: $sortBy, sortOrder: $sortOrder) {
      items { id role company period type icon color points order }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const UPSERT_EXPERIENCE = `
  mutation UpsertExperience($userId: ID!, $input: ExperienceInput!) {
    upsertExperience(userId: $userId, input: $input) {
      id
    }
  }
`;

const DELETE_EXPERIENCE = `
  mutation DeleteExperience($id: ID!) {
    deleteExperience(id: $id)
  }
`;

export default function ExperienceAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;
  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN" || role === "MEMBER";

  const [items, setItems] = useState<Experience[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 10;

  const debouncedSearch = useDebounce(search);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const fetch_ = useCallback(async () => {
    if (!username) return;
    try {
      const data = await graphqlClient.query(GET_EXPERIENCES, { username, page, limit, search: debouncedSearch || undefined, type: filterType || undefined, sortBy, sortOrder });
      setItems(data?.getExperiences?.items || []);
      setPageInfo(data?.getExperiences?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching experience:", error);
    }
  }, [username, page, debouncedSearch, filterType, sortBy, sortOrder]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filterType, sortBy, sortOrder]);

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
    if (!userId) return;
    const ok = await confirm({
      title: editing ? "Save changes?" : "Add record?",
      message: editing ? "Your updates will be published immediately." : "This experience record will be added to your resume.",
      confirmLabel: editing ? "Save Changes" : "Add Record",
      danger: false,
    });
    if (!ok) return;
    setLoading(true);
    try {
      const input: any = {
        role: form.role,
        company: form.company,
        period: form.period,
        type: form.type,
        icon: form.icon,
        color: form.color,
        points: form.points.filter((p) => p.trim() !== ""),
        order: form.order,
      };
      if (editing?.id) input.id = editing.id;

      await graphqlClient.mutate(UPSERT_EXPERIENCE, { userId, input });
      setModal(false);
      await fetch_();
    } catch (error) {
      console.error("Error saving experience:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete this record?", message: "This experience entry will be permanently removed from your resume.", confirmLabel: "Delete", danger: true })) return;
    try {
      await graphqlClient.mutate(DELETE_EXPERIENCE, { id });
      await fetch_();
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Experience & Education</h1>
        <p className={styles.pageSubtitle}>Manage your resume points across experience and education</p>
      </div>
      
      <div className={styles.tableHeader}>
        <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap"}}>
          <input className={styles.input} style={{maxWidth:220}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className={styles.select} style={{maxWidth:160}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} style={{maxWidth:130}} value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
            <option value="asc">Order Asc</option>
            <option value="desc">Order Desc</option>
          </select>
        </div>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{pageInfo?.total ?? items.length} records found</span>
        {canEdit && <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Add Record</button>}
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
                  {canEdit && <button className={styles.btnEdit} onClick={() => openModal(item)}>Edit</button>}
                  {canEdit && <button className={styles.btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>💼</div><div className={styles.emptyText}>No experience added yet. Add your first career milestone!</div></div></td></tr>}
        </tbody>
      </table>
      {pageInfo && pageInfo.totalPages > 1 && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:16}}>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasPrev} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>Page {pageInfo.page} of {pageInfo.totalPages}</span>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasNext} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

      {confirmDialog}
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
