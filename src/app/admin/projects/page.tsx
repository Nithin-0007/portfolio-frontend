"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { useDebounce } from "@/lib/useDebounce";
import { useConfirm } from "../components/ConfirmDialog";

interface Project { id: string; title: string; description: string; tags: string[]; category: string; icon: string; color: string; github?: string; live?: string; featured: boolean; published: boolean; }

const empty: Omit<Project, "id"> = { title: "", description: "", tags: [], category: "Web App", icon: "💼", color: "#7c3aed", github: "", live: "", featured: false, published: true };
const CATEGORIES = ["Web App", "Full-Stack", "AI/ML", "Mobile", "Tool", "Other"];

const GET_PROJECTS = `
  query GetProjects($username: String!, $admin: Boolean, $page: Int, $limit: Int, $search: String, $category: String, $sortBy: String, $sortOrder: String) {
    getProjects(username: $username, admin: $admin, page: $page, limit: $limit, search: $search, category: $category, sortBy: $sortBy, sortOrder: $sortOrder) {
      items { id title description tags category icon color github live featured published order }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const UPSERT_PROJECT = `
  mutation UpsertProject($userId: ID!, $input: ProjectInput!) {
    upsertProject(userId: $userId, input: $input) {
      id
    }
  }
`;

const DELETE_PROJECT = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export default function ProjectsAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;
  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN" || role === "MEMBER";

  const [projects, setProjects] = useState<Project[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
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
      const data = await graphqlClient.query(GET_PROJECTS, { username, admin: true, page, limit, search: debouncedSearch || undefined, category: category || undefined, sortBy, sortOrder });
      setProjects(data?.getProjects?.items || []);
      setPageInfo(data?.getProjects?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [username, page, debouncedSearch, category, sortBy, sortOrder]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sortBy, sortOrder]);

  const openModal = (p?: Project) => {
    setEditing(p || null);
    setForm(p ? { ...p } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    const ok = await confirm({
      title: editing ? "Save changes?" : "Create project?",
      message: editing ? "Your updates will be published immediately." : "This project will be added to your portfolio.",
      confirmLabel: editing ? "Save Changes" : "Create",
      danger: false,
      icon: editing ? "◈" : "◈",
    });
    if (!ok) return;
    setLoading(true);
    try {
      const input: any = {
        title: form.title,
        description: form.description,
        tags: form.tags,
        category: form.category,
        icon: form.icon,
        color: form.color,
        github: form.github || undefined,
        live: form.live || undefined,
        featured: form.featured,
        published: form.published,
      };
      if (editing?.id) input.id = editing.id;
      await graphqlClient.mutate(UPSERT_PROJECT, { userId, input });
      setModal(false);
      await fetch_();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this project?",
      message: "This will permanently remove the project from your portfolio. This action cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await graphqlClient.mutate(DELETE_PROJECT, { id });
      await fetch_();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Projects</h1>
        <p className={styles.pageSubtitle}>Manage your portfolio projects</p>
      </div>
      <div className={styles.tableHeader}>
        <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap"}}>
          <input className={styles.input} style={{maxWidth:220}} placeholder="Search projects..." value={search} onChange={e=>{setSearch(e.target.value);}}/>
          <select className={styles.select} style={{maxWidth:160}} value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select className={styles.select} style={{maxWidth:140}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="order">Sort: Order</option>
            <option value="title">Sort: Title</option>
            <option value="createdAt">Sort: Date</option>
          </select>
          <select className={styles.select} style={{maxWidth:120}} value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{pageInfo?.total ?? projects.length} projects</span>
        {canEdit && <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Add Project</button>}
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
              <td><div className={styles.btnGroup}>{canEdit && <button className={styles.btnEdit} onClick={() => openModal(p)}>Edit</button>}{canEdit && <button className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Delete</button>}</div></td>
            </tr>
          ))}
          {projects.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>💼</div><div className={styles.emptyText}>No projects yet. Add your first one!</div></div></td></tr>}
        </tbody>
      </table>
      {pageInfo && pageInfo.totalPages > 1 && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:16}}>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasPrev} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>Page {pageInfo.page} of {pageInfo.totalPages}</span>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasNext} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

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
      {confirmDialog}
    </div>
  );
}
