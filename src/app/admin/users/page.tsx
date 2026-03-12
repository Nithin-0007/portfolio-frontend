"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";

interface User { id: string; name: string; email: string; phone?: string; role: string; status: "ACTIVE" | "INACTIVE"; lastLogin?: string; createdAt: string; }
const emptyForm = { name: "", email: "", phone: "", password: "", role: "VIEWER" };

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.data || []);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (u?: User) => {
    setEditing(u || null);
    setForm(u ? { name: u.name, email: u.email, phone: u.phone || "", password: "", role: u.role } : emptyForm);
    setModal(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    if (editing && !form.password) { const b = body as Record<string,unknown>; delete b.password; }
    await fetch("/api/users", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    setModal(false); await fetch_(); setLoading(false);
  };

  const toggleStatus = async (u: User) => {
    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await fetch("/api/users", { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ id: u.id, status: newStatus }) 
    });
    await fetch_();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users?id=${id}`, { method:"DELETE" });
    await fetch_();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>User Management</h1><p className={styles.pageSubtitle}>Invite and manage portfolio users</p></div>
      <div className={styles.tableHeader}><span style={{color:"#94a3b8",fontSize:"0.875rem"}}>{users.length} users</span><button className={styles.btnPrimary} onClick={()=>openModal()}>➕ Invite User</button></div>
      <table className={styles.table}>
        <thead><tr><th>User</th><th>Email / Phone</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:700,color:"white",flexShrink:0}}>{u.name[0]}</div><div style={{fontWeight:600,color:"#f8fafc"}}>{u.name}</div></div></td>
              <td>
                <div style={{fontSize:"0.85rem"}}>{u.email}</div>
                {u.phone && <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{u.phone}</div>}
              </td>
              <td><span className={`${styles.badge} ${u.role==="ADMIN"?styles.badgePurple:styles.badgeBlue}`}>{u.role}</span></td>
              <td>
                <span className={`${styles.badge} ${u.status === "ACTIVE" ? styles.badgeGreen : styles.badgeRed}`}>
                  {u.status}
                </span>
              </td>
              <td style={{fontSize:"0.8rem"}}>{u.lastLogin?new Date(u.lastLogin).toLocaleDateString():"Never"}</td>
              <td><div className={styles.btnGroup}><button className={styles.btnEdit} onClick={()=>openModal(u)}>Edit</button><button className={styles.btnSecondary} style={{padding:"5px 11px",fontSize:"0.78rem"}} onClick={()=>toggleStatus(u)}>{u.status === "ACTIVE" ? "Deactivate" : "Activate"}</button><button className={styles.btnDanger} onClick={()=>handleDelete(u.id)}>Delete</button></div></td>
            </tr>
          ))}
          {users.length===0&&<tr><td colSpan={6}><div className={styles.emptyState}><div className={styles.emptyIcon}>👥</div><div className={styles.emptyText}>No users found.</div></div></td></tr>}
        </tbody>
      </table>

      {modal&&(<div className={styles.modal} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
        <div className={styles.modalCard}>
          <h3 className={styles.modalTitle}>{editing?"Edit User":"Add User"}</h3>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}><label className={styles.label}>Full Name</label><input className={styles.input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full Name"/></div>
              <div className={styles.formGroup}><label className={styles.label}>Role</label><select className={styles.select} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="ADMIN">Admin</option><option value="VIEWER">Viewer</option></select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15}}>
              <div className={styles.formGroup}><label className={styles.label}>Email</label><input type="email" className={styles.input} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="user@example.com"/></div>
              <div className={styles.formGroup}><label className={styles.label}>Phone (Optional)</label><input type="text" className={styles.input} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91..."/></div>
            </div>
            <div className={styles.formGroup}><label className={styles.label}>{editing?"New Password (leave blank to keep)":"Password"}</label><input type="password" className={styles.input} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></div>
            <div className={styles.formActions}><button className={styles.btnSecondary} onClick={()=>setModal(false)}>Cancel</button><button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>{loading?"Saving...":"Save User"}</button></div>
          </div>
        </div>
      </div>)}
    </div>
  );
}
