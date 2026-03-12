"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Event { id: string; title: string; description: string; date: string; location: string; type: string; status: string; featured: boolean; virtual: boolean; meetingUrl?: string; tags: string[]; capacity?: number; }

const empty: Omit<Event, "id"> = { title: "", description: "", date: new Date().toISOString().slice(0,16), location: "", type: "OTHER", status: "DRAFT", featured: false, virtual: false, meetingUrl: "", tags: [], capacity: undefined };
const TYPES = ["CONFERENCE","MEETUP","TALK","WORKSHOP","WEBINAR","OTHER"];
const STATUSES = ["DRAFT","PUBLISHED","CANCELLED","COMPLETED"];

function statusBadge(s: string) {
  const map: Record<string,string> = { PUBLISHED: "badgeGreen", DRAFT: "badgeGray", CANCELLED: "badgeRed", COMPLETED: "badgeBlue" };
  return `${styles.badge} ${styles[map[s] || "badgeGray"]}`;
}

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/events?admin=true");
    const data = await res.json();
    setEvents(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (e?: Event) => {
    setEditing(e || null);
    setForm(e ? { ...e, date: new Date(e.date).toISOString().slice(0,16) } : empty);
    setModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/events", { method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
    setModal(false); await fetch_(); setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    await fetch_();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Events</h1><p className={styles.pageSubtitle}>Manage your speaking engagements, meetups & conferences</p></div>
      <div className={styles.tableHeader}><span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{events.length} events</span><button className={styles.btnPrimary} onClick={() => openModal()}>➕ Create Event</button></div>
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
              <td><div className={styles.btnGroup}><button className={styles.btnEdit} onClick={() => openModal(e)}>Edit</button><button className={styles.btnDanger} onClick={() => handleDelete(e.id)}>Delete</button></div></td>
            </tr>
          ))}
          {events.length === 0 && <tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>🎯</div><div className={styles.emptyText}>No events yet.</div></div></td></tr>}
        </tbody>
      </table>

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
