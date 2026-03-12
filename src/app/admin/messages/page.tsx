"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface Msg { id: string; name: string; email: string; subject: string; message: string; read: boolean; replied: boolean; createdAt: string; }

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<Msg | null>(null);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markRead = async (id: string) => {
    await fetch("/api/messages", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, read: true }) });
    await fetch_();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/messages?id=${id}`, { method:"DELETE" });
    setSelected(null); await fetch_();
  };

  const openMsg = async (m: Msg) => {
    setSelected(m);
    if (!m.read) await markRead(m.id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Messages</h1><p className={styles.pageSubtitle}>Contact form submissions from your portfolio</p></div>
      <div className={styles.tableHeader}><span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{messages.filter(m=>!m.read).length} unread of {messages.length}</span></div>
      <table className={styles.table}>
        <thead><tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m.id} style={!m.read?{background:"rgba(124,58,237,0.04)"}:{}}>
              <td><div style={{fontWeight:m.read?400:700,color:"#f8fafc"}}>{m.name}</div><div style={{fontSize:"0.75rem",color:"#475569"}}>{m.email}</div></td>
              <td style={{color:m.read?"#94a3b8":"#f8fafc",fontWeight:m.read?400:600}}>{m.subject}</td>
              <td style={{fontSize:"0.8rem"}}>{new Date(m.createdAt).toLocaleDateString()}</td>
              <td><span className={`${styles.badge} ${m.read?styles.badgeGray:styles.badgeBlue}`}>{m.read?"Read":"New"}</span></td>
              <td><div className={styles.btnGroup}><button className={styles.btnEdit} onClick={()=>openMsg(m)}>View</button><button className={styles.btnDanger} onClick={()=>handleDelete(m.id)}>Delete</button></div></td>
            </tr>
          ))}
          {messages.length===0&&<tr><td colSpan={5}><div className={styles.emptyState}><div className={styles.emptyIcon}>📬</div><div className={styles.emptyText}>No messages yet.</div></div></td></tr>}
        </tbody>
      </table>

      {selected&&(
        <div className={styles.modal} onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Message from {selected.name}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div className={styles.label}>Name</div><div style={{color:"#f8fafc",marginTop:4}}>{selected.name}</div></div>
                <div><div className={styles.label}>Email</div><div style={{color:"#06b6d4",marginTop:4}}><a href={`mailto:${selected.email}`} style={{color:"inherit"}}>{selected.email}</a></div></div>
              </div>
              <div><div className={styles.label}>Subject</div><div style={{color:"#f8fafc",marginTop:4,fontWeight:600}}>{selected.subject}</div></div>
              <div><div className={styles.label}>Message</div><div style={{color:"#94a3b8",marginTop:4,lineHeight:1.7,background:"rgba(255,255,255,0.03)",padding:16,borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>{selected.message}</div></div>
              <div style={{color:"#475569",fontSize:"0.78rem"}}>{new Date(selected.createdAt).toLocaleString()}</div>
              <div className={styles.formActions}>
                <button className={styles.btnDanger} onClick={()=>handleDelete(selected.id)}>Delete</button>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className={styles.btnPrimary} style={{textDecoration:"none"}}>📧 Reply via Email</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
