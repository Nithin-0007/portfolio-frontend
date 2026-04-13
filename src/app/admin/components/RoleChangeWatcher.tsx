"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL = 30_000; // 30 seconds

export default function RoleChangeWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionRole = (session?.user as any)?.role as string | undefined;

  const check = async () => {
    // Only check when session is loaded and role is known
    if (status !== "authenticated" || !sessionRole) return;

    try {
      const res = await fetch("/api/auth/role-check", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const dbRole: string | null = data.role;
      const dbStatus: string | null = data.status;

      // Role was changed by admin
      if (dbRole && dbRole !== sessionRole) {
        setNewRole(dbRole);
        setShowDialog(true);
        // Stop polling once dialog is shown
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      // Account was deactivated
      if (dbStatus === "INACTIVE") {
        setNewRole("__deactivated__");
        setShowDialog(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      // Silent fail — network errors shouldn't disrupt the user
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    // Start polling after a short initial delay
    const initial = setTimeout(check, 5_000);
    timerRef.current = setInterval(check, POLL_INTERVAL);

    return () => {
      clearTimeout(initial);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionRole]);

  const handleOk = async () => {
    setLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  if (!showDialog) return null;

  const isDeactivated = newRole === "__deactivated__";
  const roleLabel = (r: string) =>
    r === "ADMIN" ? "Admin" : r === "MEMBER" ? "Member" : "Viewer";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2, 5, 12, 0.85)",
      backdropFilter: "blur(10px)",
      animation: "rcwFadeIn 0.25s ease",
    }}>
      <style>{`
        @keyframes rcwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rcwSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{
        background: "#080f1f",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "36px 40px",
        maxWidth: 420,
        width: "90%",
        boxShadow: "0 32px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.15)",
        animation: "rcwSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: isDeactivated
            ? "rgba(239,68,68,0.12)"
            : "rgba(251,191,36,0.12)",
          border: isDeactivated
            ? "2px solid rgba(239,68,68,0.3)"
            : "2px solid rgba(251,191,36,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", margin: "0 auto 20px",
        }}>
          {isDeactivated ? "🔒" : "🔔"}
        </div>

        {/* Title */}
        <div style={{
          fontSize: "1.15rem", fontWeight: 800, color: "#f8fafc",
          marginBottom: 12, letterSpacing: "-0.02em",
        }}>
          {isDeactivated ? "Account Deactivated" : "Role Updated by Admin"}
        </div>

        {/* Message */}
        <div style={{
          fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.7,
          marginBottom: 8,
        }}>
          {isDeactivated ? (
            <>
              Your account has been <span style={{ color: "#f87171", fontWeight: 600 }}>deactivated</span> by the administrator.
              Please contact admin for assistance.
            </>
          ) : (
            <>
              An administrator has changed your role to{" "}
              <span style={{
                display: "inline-block",
                background: "rgba(124,58,237,0.15)",
                color: "#a78bfa",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 6, padding: "1px 10px",
                fontWeight: 700, fontSize: "0.85rem",
              }}>
                {roleLabel(newRole)}
              </span>
            </>
          )}
        </div>

        {!isDeactivated && (
          <div style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 28, lineHeight: 1.6 }}>
            Please log in again for the changes to take effect.
          </div>
        )}

        {isDeactivated && (
          <div style={{ height: 28 }} />
        )}

        {/* OK Button */}
        <button
          onClick={handleOk}
          disabled={loggingOut}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #0e7490 100%)",
            backgroundSize: "200% auto",
            color: "#fff",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: loggingOut ? "not-allowed" : "pointer",
            opacity: loggingOut ? 0.7 : 1,
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            transition: "all 0.25s ease",
            boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
          }}
        >
          {loggingOut ? "Logging out..." : "OK — Go to Login"}
        </button>
      </div>
    </div>
  );
}
