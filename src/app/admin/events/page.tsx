"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { useDebounce } from "@/lib/useDebounce";
import { useConfirm } from "../components/ConfirmDialog";

interface Event { id: string; title: string; description: string; date: string; location: string; type: string; status: string; featured: boolean; virtual: boolean; meetingUrl?: string; tags: string[]; capacity?: number; }

const empty: Omit<Event, "id"> = { title: "", description: "", date: new Date().toISOString().slice(0,16), location: "", type: "OTHER", status: "DRAFT", featured: false, virtual: false, meetingUrl: "", tags: [], capacity: undefined };
const TYPES = ["CONFERENCE","MEETUP","TALK","WORKSHOP","WEBINAR","OTHER"];
const STATUSES = ["DRAFT","PUBLISHED","CANCELLED","COMPLETED"];

const GET_EVENTS = `
  query GetEvents($username: String!, $page: Int, $limit: Int, $search: String, $type: String, $status: String, $sortBy: String, $sortOrder: String) {
    getEvents(username: $username, page: $page, limit: $limit, search: $search, type: $type, status: $status, sortBy: $sortBy, sortOrder: $sortOrder) {
      items { id title description date location type status featured virtual meetingUrl tags capacity }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const UPSERT_EVENT = `
  mutation UpsertEvent($userId: ID!, $input: EventInput!) {
    upsertEvent(userId: $userId, input: $input) {
      id
    }
  }
`;

const DELETE_EVENT = `
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

function statusBadge(s: string) {
  const map: Record<string,string> = { PUBLISHED: "badgeGreen", DRAFT: "badgeGray", CANCELLED: "badgeRed", COMPLETED: "badgeBlue" };
  return `${styles.badge} ${styles[map[s] || "badgeGray"]}`;
}

export default function EventsAdmin() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;
  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN" || role === "MEMBER";

  const [events, setEvents] = useState<Event[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 10;

  const debouncedSearch = useDebounce(search);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const fetch_ = useCallback(async () => {
    if (!username) return;
    try {
      const data = await graphqlClient.query(GET_EVENTS, { username, page, limit, search: debouncedSearch || undefined, type: filterType || undefined, status: filterStatus || undefined, sortBy, sortOrder });
      setEvents(data?.getEvents?.items || []);
      setPageInfo(data?.getEvents?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [username, page, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const openModal = (e?: Event) => {
    setEditing(e || null);
    setForm(e ? { ...e, date: new Date(e.date).toISOString().slice(0,16) } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    const ok = await confirm({
      title: editing ? "Save changes?" : "Create event?",
      message: editing ? "Your updates will be published immediately." : "This event will be added to your portfolio.",
      confirmLabel: editing ? "Save Changes" : "Create Event",
      danger: false,
    });
    if (!ok) return;
    setLoading(true);
    try {
      const input: any = {
        title: form.title,
        description: form.description,
        date: new Date(form.date).toISOString(),
        location: form.location || undefined,
        type: form.type,
        status: form.status,
        featured: form.featured,
        virtual: form.virtual,
        meetingUrl: form.meetingUrl || undefined,
        tags: form.tags,
        capacity: form.capacity || undefined,
      };
      if (editing?.id) input.id = editing.id;
      
      await graphqlClient.mutate(UPSERT_EVENT, { userId, input });
      setModal(false);
      await fetch_();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete this event?", message: "This event will be permanently removed. This action cannot be undone.", confirmLabel: "Delete", danger: true })) return;
    try {
      await graphqlClient.mutate(DELETE_EVENT, { id });
      await fetch_();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Events</h1><p className={styles.pageSubtitle}>Manage your speaking engagements, meetups & conferences</p></div>
      <div className={styles.tableHeader}>
        <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap"}}>
          <input className={styles.input} style={{maxWidth:200}} placeholder="Search events..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className={styles.select} style={{maxWidth:150}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} style={{maxWidth:150}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select className={styles.select} style={{maxWidth:130}} value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{pageInfo?.total ?? events.length} events</span>
        {canEdit && <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Create Event</button>}
      </div>
      <table className={styles.table}>
        <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td><div style={{fontWeight:600,color:"#f8fafc"}}>{e.featured?"⭐ ":""}{e.title}</div></td>
              <td style={{fontSize:"0.82rem"}}>{new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
              <td style={{fontSize:"0.82rem"}}>{e.virtual?"🌐 Virtual":e.location}</td>
              <td><span className={`${styles.badge} ${styles.badgePurple}`}>{e.type}</span></td>
              <td><span className={statusBadge(e.status)}>{e.status}</span></td>
              <td><div className={styles.btnGroup}>{canEdit && <button className={styles.btnEdit} onClick={() => openModal(e)}>Edit</button>}{canEdit && <button className={styles.btnDanger} onClick={() => handleDelete(e.id)}>Delete</button>}</div></td>
            </tr>
          ))}
          {events.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>🎯</div><div className={styles.emptyText}>No events yet.</div></div></td></tr>}
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
            <h3 className={styles.modalTitle}>{editing?"Edit Event":"Create Event"}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label className={styles.label}>Title</label><input className={styles.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Event Title"/></div>
              <div className={styles.formGroup}><label className={styles.label}>Description</label><textarea className={styles.textarea} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label className={styles.label}>Date & Time</label><input type="datetime-local" className={styles.input} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Type</label><select className={styles.select} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label className={styles.label}>Status</label><select className={styles.select} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
                <div className={styles.formGroup}><label className={styles.label}>Capacity</label><input type="number" className={styles.input} value={form.capacity||""} onChange={e=>setForm({...form,capacity:Number(e.target.value)||undefined})} placeholder="Unlimited"/></div>
              </div>
              <div style={{display:"flex",gap:16}}>
                <label className={styles.checkbox}><input type="checkbox" className={styles.checkboxInput} checked={form.virtual} onChange={e=>setForm({...form,virtual:e.target.checked})}/> Virtual Event</label>
                <label className={styles.checkbox}><input type="checkbox" className={styles.checkboxInput} checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label>
              </div>
              {form.virtual ? <div className={styles.formGroup}><label className={styles.label}>Meeting URL</label><input className={styles.input} value={form.meetingUrl||""} onChange={e=>setForm({...form,meetingUrl:e.target.value})} placeholder="https://meet.google.com/..."/></div>
                : <div className={styles.formGroup}><label className={styles.label}>Location</label><input className={styles.input} value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Chennai, Tamil Nadu"/></div>}
              <div className={styles.formGroup}><label className={styles.label}>Tags (comma-separated)</label><input className={styles.input} value={form.tags.join(", ")} onChange={e=>setForm({...form,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})}/></div>
              <div className={styles.formActions}><button className={styles.btnSecondary} onClick={()=>setModal(false)}>Cancel</button><button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>{loading?"Saving...":"Save Event"}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
