"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { graphqlClient } from "@/lib/graphql-client";
import { useDebounce } from "@/lib/useDebounce";
import { useConfirm } from "../components/ConfirmDialog";

interface Msg { id: string; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string; }

const GET_MESSAGES = `
  query GetMessages($username: String!, $page: Int, $limit: Int, $search: String, $read: Boolean, $sortBy: String, $sortOrder: String) {
    getMessages(username: $username, page: $page, limit: $limit, search: $search, read: $read, sortBy: $sortBy, sortOrder: $sortOrder) {
      items { id name email subject message read createdAt }
      pageInfo { total page limit totalPages hasNext hasPrev }
    }
  }
`;

const MARK_READ = `
  mutation MarkMessageRead($id: ID!) {
    markMessageRead(id: $id) { id read }
  }
`;

const DELETE_MESSAGE = `
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`;

export default function MessagesAdmin() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const limit = 15;

  const debouncedSearch = useDebounce(search);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const fetch_ = useCallback(async () => {
    if (!username) return;
    try {
      const readFilter = filterRead === "" ? undefined : filterRead === "true";
      const data = await graphqlClient.query(GET_MESSAGES, { username, page, limit, search: debouncedSearch || undefined, read: readFilter, sortBy: "createdAt", sortOrder: "desc" });
      setMessages(data?.getMessages?.items || []);
      setPageInfo(data?.getMessages?.pageInfo || null);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [username, page, debouncedSearch, filterRead]);

  useEffect(() => { fetch_(); }, [fetch_]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filterRead]);

  const markRead = async (id: string) => {
    try {
      await graphqlClient.mutate(MARK_READ, { id });
      await fetch_();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete this message?", message: "This message will be permanently removed. This action cannot be undone.", confirmLabel: "Delete", danger: true })) return;
    try {
      await graphqlClient.mutate(DELETE_MESSAGE, { id });
      setSelected(null);
      await fetch_();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const openMsg = async (m: Msg) => {
    setSelected(m);
    if (!m.read) await markRead(m.id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Messages</h1><p className={styles.pageSubtitle}>Contact form submissions from your portfolio</p></div>
      <div className={styles.tableHeader}>
        <div style={{display:"flex",gap:8,flex:1,flexWrap:"wrap"}}>
          <input className={styles.input} style={{maxWidth:220}} placeholder="Search messages..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className={styles.select} style={{maxWidth:140}} value={filterRead} onChange={e=>setFilterRead(e.target.value)}>
            <option value="">All Messages</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>
        </div>
        <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{messages.filter(m=>!m.read).length} unread of {pageInfo?.total ?? messages.length}</span>
      </div>
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
      {pageInfo && pageInfo.totalPages > 1 && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:16}}>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasPrev} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span style={{color:"#94a3b8",fontSize:"0.875rem"}}>Page {pageInfo.page} of {pageInfo.totalPages}</span>
          <button className={styles.btnSecondary} disabled={!pageInfo.hasNext} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

      {confirmDialog}
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
