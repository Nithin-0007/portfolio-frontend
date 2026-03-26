"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "../admin-pages.module.css";
import { useSession } from "next-auth/react";
import { useConfirm } from "../components/ConfirmDialog";

interface User {
  id: string; name: string; email: string; phone?: string; username: string;
  role: string; status: "ACTIVE" | "INACTIVE"; lastLogin?: string; createdAt: string;
}

const emptyForm = { name: "", email: "", phone: "", username: "", role: "VIEWER" };

async function userApi(action: string, body: object) {
  const res = await fetch("/api/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function UsersAdmin() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  if (session && !isAdmin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "3rem" }}>🔒</div>
        <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.2rem" }}>Access Restricted</div>
        <div style={{ color: "#475569", fontSize: "0.875rem" }}>Only Admins can manage users.</div>
      </div>
    );
  }

  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [inviteResult, setInviteResult] = useState<{ tempPassword: string; email: string } | null>(null);

  // OTP reset state
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpNewPass, setOtpNewPass] = useState("");
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [otpMsg, setOtpMsg] = useState("");

  const { confirm, dialog: confirmDialog } = useConfirm();

  const fetch_ = useCallback(async () => {
    setFetching(true);
    try {
      const data = await userApi("list", {});
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openModal = (u?: User) => {
    setEditing(u || null);
    setForm(u ? { name: u.name, email: u.email, phone: u.phone || "", username: u.username, role: u.role } : emptyForm);
    setError("");
    setInviteResult(null);
    setModal(true);
  };

  const handleSave = async () => {
    const ok = await confirm({
      title: editing ? "Save changes?" : "Invite this user?",
      message: editing ? "The user's role and details will be updated." : "An invitation with a temporary password will be created.",
      confirmLabel: editing ? "Save Changes" : "Send Invite",
      danger: false,
    });
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      if (editing) {
        await userApi("update", { id: editing.id, name: form.name, role: form.role });
        setModal(false);
        await fetch_();
      } else {
        const result = await userApi("invite", form);
        setInviteResult({ tempPassword: result.tempPassword, email: form.email || form.phone });
        await fetch_();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (u: User) => {
    const action = u.status === "ACTIVE" ? "Deactivate" : "Activate";
    const ok = await confirm({
      title: `${action} this user?`,
      message: u.status === "ACTIVE" ? "The user will lose access to their admin panel." : "The user will regain access to their admin panel.",
      confirmLabel: action,
      danger: u.status === "ACTIVE",
    });
    if (!ok) return;
    try {
      await userApi("update", { id: u.id, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      await fetch_();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Delete this user?", message: "This will permanently delete the user and all their portfolio data. This action cannot be undone.", confirmLabel: "Delete User", danger: true })) return;
    try {
      await userApi("delete", { id });
      await fetch_();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setOtpMsg("");
    try {
      await userApi("send-otp", { identifier: otpIdentifier });
      setOtpStep("verify");
      setOtpMsg("OTP sent! Check your email or phone.");
    } catch (e: any) {
      setOtpMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setOtpMsg("");
    try {
      await userApi("verify-otp", { identifier: otpIdentifier, otp: otpCode, newPassword: otpNewPass });
      setOtpMsg("Password reset successful! You can now log in.");
      setOtpStep("send");
      setOtpCode(""); setOtpNewPass(""); setOtpIdentifier("");
    } catch (e: any) {
      setOtpMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Invite and manage portfolio users via Cognito OTP</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.btnSecondary} onClick={() => { setOtpStep("send"); setOtpMsg(""); setOtpModal(true); }}>
            🔑 Reset Password (OTP)
          </button>
          {isAdmin && <button className={styles.btnPrimary} onClick={() => openModal()}>➕ Invite User</button>}
        </div>
      </div>

      {fetching ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (
        <>
          <div className={styles.tableHeader}>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{users.length} users</span>
          </div>
          <table className={styles.table}>
            <thead><tr>
              <th>User</th><th>Email / Phone</th><th>Username</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600, color: "#f8fafc" }}>{u.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{u.email}</div>
                    {u.phone && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{u.phone}</div>}
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>@{u.username}</td>
                  <td><span className={`${styles.badge} ${u.role === "ADMIN" ? styles.badgePurple : styles.badgeBlue}`}>{u.role}</span></td>
                  <td><span className={`${styles.badge} ${u.status === "ACTIVE" ? styles.badgeGreen : styles.badgeRed}`}>{u.status}</span></td>
                  <td style={{ fontSize: "0.8rem" }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}</td>
                  <td>
                    {isAdmin && (
                      <div className={styles.btnGroup}>
                        <button className={styles.btnEdit} onClick={() => openModal(u)}>Edit</button>
                        <button className={styles.btnSecondary} style={{ padding: "5px 11px", fontSize: "0.78rem" }} onClick={() => toggleStatus(u)}>
                          {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                        <button className={styles.btnDanger} onClick={() => handleDelete(u.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <div className={styles.emptyText}>No users found. Invite your first user!</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {confirmDialog}
      {/* ── Invite / Edit Modal ── */}
      {modal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{editing ? "Edit User" : "Invite New User"}</h3>

            {inviteResult ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
                <p style={{ color: "#22c55e", fontWeight: 600, marginBottom: 8 }}>User invited successfully!</p>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 16 }}>
                  Send these credentials to <strong style={{ color: "#f8fafc" }}>{inviteResult.email}</strong>
                </p>
                <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>Temporary Password</div>
                  <div style={{ fontFamily: "monospace", fontSize: "1.1rem", color: "#a78bfa", letterSpacing: 2 }}>{inviteResult.tempPassword}</div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b" }}>User should reset their password via OTP after first login.</p>
                <button className={styles.btnPrimary} style={{ marginTop: 16 }} onClick={() => setModal(false)}>Done</button>
              </div>
            ) : (
              <div className={styles.formGrid}>
                {error && <div style={{ color: "#f87171", fontSize: "0.85rem", padding: "8px 12px", background: "rgba(248,113,113,0.1)", borderRadius: 6 }}>⚠️ {error}</div>}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <select className={styles.select} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </div>
                </div>
                {!editing && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Username (portfolio URL)</label>
                      <input className={styles.input} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} placeholder="e.g. john-doe" />
                      <small style={{ color: "#64748b", fontSize: "0.78rem" }}>Portfolio: /{form.username || "username"}</small>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input type="email" className={styles.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Phone (optional)</label>
                        <input className={styles.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
                      </div>
                    </div>
                  </>
                )}
                <div className={styles.formActions}>
                  <button className={styles.btnSecondary} onClick={() => setModal(false)}>Cancel</button>
                  <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : editing ? "Save Changes" : "Send Invite"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OTP Reset Modal ── */}
      {otpModal && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setOtpModal(false)}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>🔑 Reset Password via OTP</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 20 }}>
              Enter your email or phone number. We&apos;ll send a one-time code via {otpIdentifier.includes("@") ? "email (SES)" : "SMS (SNS)"}.
            </p>
            {otpMsg && (
              <div style={{ color: otpMsg.includes("success") ? "#22c55e" : "#f87171", fontSize: "0.85rem", padding: "8px 12px", background: otpMsg.includes("success") ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)", borderRadius: 6, marginBottom: 16 }}>
                {otpMsg}
              </div>
            )}
            {otpStep === "send" ? (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email or Phone Number</label>
                  <input className={styles.input} value={otpIdentifier} onChange={(e) => setOtpIdentifier(e.target.value)} placeholder="you@example.com or +91..." />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.btnSecondary} onClick={() => setOtpModal(false)}>Cancel</button>
                  <button className={styles.btnPrimary} onClick={handleSendOtp} disabled={loading || !otpIdentifier}>
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>OTP Code</label>
                  <input className={styles.input} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <input type="password" className={styles.input} value={otpNewPass} onChange={(e) => setOtpNewPass(e.target.value)} placeholder="New password (min 8 chars)" minLength={8} />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.btnSecondary} onClick={() => setOtpStep("send")}>← Back</button>
                  <button className={styles.btnPrimary} onClick={handleVerifyOtp} disabled={loading || !otpCode || !otpNewPass}>
                    {loading ? "Verifying..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
