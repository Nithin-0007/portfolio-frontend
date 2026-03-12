"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Notif { id: string; title: string; message: string; type: string; read: boolean; broadcast: boolean; createdAt: string; }
const TYPES = ["INFO","SUCCESS","WARNING","ERROR","ANNOUNCEMENT"];
const empty = { title: "", message: "", type: "INFO", broadcast: true };

export default function NotificationsAdmin() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifs(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSend = async () => {
    setLoading(true);
    await fetch("/api/notifications", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    setModal(false); await fetch_(); setLoading(false);
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: "all", read: true }) });
    await fetch_();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method:"DELETE" });
    await fetch_();
  };

  const typeColor: Record<string,string> = { INFO:"badgeBlue",SUCCESS:"badgeGreen",WARNING:"badgePurple",ERROR:"badgeRed",ANNOUNCEMENT:"badgePurple" };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Notifications</h1><p className={styles.pageSubtitle}>Send and manage portfolio notifications</p></div>
      <div className={styles.tableHeader}>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{notifs.filter(n=>!n.read).length} unread</span>
        <div className={styles.btnGroup}>
          <button className={styles.btnSecondary} onClick={markAllRead}>✅ Mark All Read</button>
          <button className={styles.btnPrimary} onClick={()=>{setForm(empty);setModal(true);}}>📣 Send Notification</button>
        </div>
      </div>
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Message</th><th>Type</th><th>Broadcast</th><th>Read</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {notifs.map((n) => (
            <tr key={n.id} style={!n.read?{background:"rgba(124,58,237,0.04)"}:{}}>
              <td style={{color:"#f8fafc",fontWeight:n.read?400:600}}>{n.title}</td>
              <td style={{maxWidth:250,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.message}</td>
              <td><span className={`${styles.badge} ${styles[typeColor[n.type]||"badgeGray"]}`}>{n.type}</span></td>
              <td>{n.broadcast?"📢 All":"👤 User"}</td>
              <td>{n.read?"✅":"🔵"}</td>
              <td style={{fontSize:"0.8rem"}}>{new Date(n.createdAt).toLocaleDateString()}</td>
              <td><button className={styles.btnDanger} onClick={()=>handleDelete(n.id)}>Delete</button></td>
            </tr>
          ))}
          {notifs.length===0&&<tr><td colSpan={7}><div className={styles.emptyState}><div className={styles.emptyIcon}>🔔</div><div className={styles.emptyText}>No notifications yet.</div></div></td></tr>}
        </tbody>
      </table>

      {modal&&(<div className={styles.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
        <div className={styles.modalCard}>
          <h3 className={styles.modalTitle}>Send Notification</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}><label className={styles.label}>Title</label><input className={styles.input} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Notification Title"/></div>
            <div className={styles.formGroup}><label className={styles.label}>Message</label><textarea className={styles.textarea} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Your message..."/></div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label className={styles.label}>Type</label><select className={styles.select} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className={styles.formGroup} style={{justifyContent:"flex-end",paddingTop:20}}><label className={styles.checkbox}><input type="checkbox" className={styles.checkboxInput} checked={form.broadcast} onChange={e=>setForm({...form,broadcast:e.target.checked})}/> Broadcast to All</label></div>
            </div>
            <div className={styles.formActions}><button className={styles.btnSecondary} onClick={()=>setModal(false)}>Cancel</button><button className={styles.btnPrimary} onClick={handleSend} disabled={loading}>{loading?"Sending...":"📣 Send"}</button></div>
          </div>
        </div>
      </div>)}
    </div>
  );
}
