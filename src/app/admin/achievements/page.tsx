"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { useDebounce } from "@/lib/useDebounce";
import { useConfirm } from "../components/ConfirmDialog";

interface Achievement {
  id: string;
  title: string;
  order: number;
}

const empty: Omit<Achievement, "id"> = { title: "", order: 0 };

const GET_ACHIEVEMENTS = `
  query GetAchievements($username: String!, $page: Int, $limit: Int, $search: String, $sortBy: String, $sortOrder: String) {
    getAchievements(username: $username, page: $page, limit: $limit, search: $search, sortBy: $sortBy, sortOrder: $sortOrder) {
      items { id title order }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const UPSERT_ACHIEVEMENT = `
  mutation UpsertAchievement($userId: ID!, $input: AchievementInput!) {
    upsertAchievement(userId: $userId, input: $input) {
      id
    }
  }
`;

const DELETE_ACHIEVEMENT = `
  mutation DeleteAchievement($id: ID!) {
    deleteAchievement(id: $id)
  }
`;

export default function AchievementsAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const [items, setItems] = useState<Achievement[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 20;

  const debouncedSearch = useDebounce(search);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const fetch_ = useCallback(async () => {
    if (!username) return;
    try {
      const data = await graphqlClient.query(GET_ACHIEVEMENTS, { username, page, limit, search: debouncedSearch || undefined, sortBy: "order", sortOrder: "asc" });
      setItems(data?.getAchievements?.items || []);
      setPageInfo(data?.getAchievements?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  }, [username, page, debouncedSearch]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const openModal = (item?: Achievement) => {
    setEditing(item || null);
    setForm(item ? { ...item } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    const ok = await confirm({
      title: editing ? "Save changes?" : "Add achievement?",
      message: editing ? "Your updates will be applied immediately." : "This achievement will be added to your timeline.",
      confirmLabel: editing ? "Save Changes" : "Add Achievement",
      danger: false,
    });
    if (!ok) return;
    setLoading(true);
    try {
      const input: any = { title: form.title, order: form.order };
      if (editing?.id) input.id = editing.id;
      await graphqlClient.mutate(UPSERT_ACHIEVEMENT, { userId, input });
      setModal(false);
      await fetch_();
    } catch (error) {
      console.error("Error saving achievement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete this achievement?", message: "This achievement will be permanently removed. This action cannot be undone.", confirmLabel: "Delete", danger: true })) return;
    try {
      await graphqlClient.mutate(DELETE_ACHIEVEMENT, { id });
      await fetch_();
    } catch (error) {
      console.error("Error deleting achievement:", error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Achievements</h1>
        <p className={styles.pageSubtitle}>Manage your timeline achievements</p>
      </div>
      
      <div className={styles.tableHeader}>
        <input className={styles.input} style={{maxWidth:260}} placeholder="Search achievements..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{pageInfo?.total ?? items.length} achievements found</span>
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
