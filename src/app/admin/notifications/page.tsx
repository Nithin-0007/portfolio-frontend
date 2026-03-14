"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";

interface Notif { id: string; title: string; message: string; type: string; read: boolean; broadcast: boolean; createdAt: string; }
const TYPES = ["INFO","SUCCESS","WARNING","ERROR","ANNOUNCEMENT"];
const empty = { title: "", message: "", type: "INFO", broadcast: true };

const GET_NOTIFICATIONS = `
  query GetNotifications($username: String!, $page: Int, $limit: Int, $read: Boolean, $type: String) {
    getNotifications(username: $username, page: $page, limit: $limit, read: $read, type: $type) {
      items { id title message type read createdAt }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

export default function NotificationsAdmin() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username;

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [filterRead, setFilterRead] = useState<string>("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 15;

  const fetch_ = useCallback(async () => {
    if (!username) return;
    try {
      const readFilter = filterRead === "" ? undefined : filterRead === "true";
      const data = await graphqlClient.query(GET_NOTIFICATIONS, { username, page, limit, read: readFilter, type: filterType || undefined });
      setNotifs(data?.getNotifications?.items || []);
      setPageInfo(data?.getNotifications?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [username, page, filterRead, filterType]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [filterRead, filterType]);

  const handleSend = async () => {
    // We need a mutation to send notifications.
    setLoading(true);
    // await graphqlClient.query(SEND_NOTIFICATION, { input: form });
    setModal(false); await fetch_(); setLoading(false);
  };

  const markAllRead = async () => {
    await fetch_();
  };

  const handleDelete = async (id: string) => {
    // await graphqlClient.query(DELETE_NOTIFICATION, { id });
    await fetch_();
  };

  const typeColor: Record<string,string> = { INFO:"badgeBlue",SUCCESS:"badgeGreen",WARNING:"badgePurple",ERROR:"badgeRed",ANNOUNCEMENT:"badgePurple" };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Notifications</h1><p className={styles.pageSubtitle}>Send and manage portfolio notifications</p></div>
      <div className={styles.tableHeader}>
        <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap"}}>
          <select className={styles.select} style={{maxWidth:150}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className={styles.select} style={{maxWidth:140}} value={filterRead} onChange={e=>setFilterRead(e.target.value)}>
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
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
      {pageInfo && pageInfo.totalPages > 1 && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:16}}>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasPrev} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>Page {pageInfo.page} of {pageInfo.totalPages}</span>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasNext} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

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
