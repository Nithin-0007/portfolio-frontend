"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

type Mode = "login" | "signup" | "forgot";

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp,   setLoginOtp]   = useState("");
  const [loginStep,  setLoginStep]  = useState<1 | 2>(1);

  // ── Signup state ─────────────────────────────────────────────────────────
  const [signupName,     setSignupName]     = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail,    setSignupEmail]    = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupOtp,      setSignupOtp]      = useState("");
  const [signupStep,     setSignupStep]     = useState<1 | 2>(1);

  // ── Forgot password state ─────────────────────────────────────────────────
  const [fpEmail,    setFpEmail]    = useState("");
  const [fpOtp,      setFpOtp]      = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpConfirm,  setFpConfirm]  = useState("");
  const [fpStep,     setFpStep]     = useState<1 | 2>(1);
  const [fpSuccess,  setFpSuccess]  = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function reset(to: Mode) {
    setError("");
    setLoading(false);
    setLoginStep(1);  setLoginEmail("");  setLoginOtp("");
    setSignupStep(1); setSignupName(""); setSignupUsername(""); setSignupEmail(""); setSignupPassword(""); setSignupOtp("");
    setFpStep(1);     setFpEmail(""); setFpOtp(""); setFpPassword(""); setFpConfirm(""); setFpSuccess(false);
    setMode(to);
  }

  async function post(url: string, body: object): Promise<{ ok: boolean; data: any }> {
    const res  = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    return { ok: res.ok, data };
  }

  // ════════════════════════════════════════════════════════════════════════
  // LOGIN HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  async function handleLoginSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/otp", { action: "login-send", email: loginEmail });
      if (!ok) { setError(data.error || "Failed to send OTP"); return; }
      setLoginStep(2);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleLoginVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loginOtp.length !== 6) { setError("Enter the 6-digit OTP code"); return; }
    setError(""); setLoading(true);
    try {
      const result = await signIn("credentials", {
        identifier: loginEmail,
        otp:        loginOtp,
        loginType:  "otp",
        redirect:   false,
      });
      if (result?.error) {
        setError("Invalid or expired OTP. Please try again.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleResendLoginOtp() {
    setError(""); setLoginOtp(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/otp", { action: "login-send", email: loginEmail });
      if (!ok) setError(data.error || "Failed to resend OTP");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  // ════════════════════════════════════════════════════════════════════════
  // SIGNUP HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  async function handleSignupSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/otp", { action: "register-send", email: signupEmail });
      if (!ok) { setError(data.error || "Failed to send OTP"); return; }
      setSignupStep(2);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleSignupVerify(e: React.FormEvent) {
    e.preventDefault();
    if (signupOtp.length !== 6) { setError("Enter the 6-digit OTP code"); return; }
    setError(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/register", {
        name: signupName, username: signupUsername,
        identifier: signupEmail, password: signupPassword, otpCode: signupOtp,
      });
      if (!ok) { setError(data.error || "Registration failed"); return; }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        identifier: signupEmail, password: signupPassword,
        loginType: "password", redirect: false,
      });
      if (result?.error) {
        setError("Account created! Please sign in using OTP.");
        reset("login");
        setLoginEmail(signupEmail);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  // ════════════════════════════════════════════════════════════════════════
  // FORGOT PASSWORD HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  async function handleFpSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/otp", { action: "forgot-send", email: fpEmail });
      if (!ok) { setError(data.error || "Failed to send OTP"); return; }
      setFpStep(2);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleFpReset(e: React.FormEvent) {
    e.preventDefault();
    if (fpOtp.length !== 6)         { setError("Enter the 6-digit OTP code"); return; }
    if (fpPassword !== fpConfirm)    { setError("Passwords do not match"); return; }
    if (fpPassword.length < 6)       { setError("Password must be at least 6 characters"); return; }
    setError(""); setLoading(true);
    try {
      const { ok, data } = await post("/api/auth/otp", {
        action: "forgot-verify", email: fpEmail, otp: fpOtp, newPassword: fpPassword,
      });
      if (!ok) { setError(data.error || "Failed to reset password"); return; }
      setFpSuccess(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ════════════════════════════════════════════════════════════════════════

  function StepDots({ total, active }: { total: number; active: number }) {
    return (
      <div className={styles.steps}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i + 1 === active ? styles.active : ""} ${i + 1 < active ? styles.done : ""}`}
          />
        ))}
      </div>
    );
  }

  function OtpHint({ email }: { email: string }) {
    return (
      <div className={styles.emailHint}>
        📬 OTP sent to <strong>{email}</strong>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  const titles: Record<Mode, string> = {
    login:  "Welcome Back",
    signup: "Create Account",
    forgot: "Reset Password",
  };
  const subtitles: Record<Mode, string> = {
    login:  loginStep === 1 ? "Enter your email to receive a sign-in OTP" : "Enter the OTP sent to your email",
    signup: signupStep === 1 ? "Fill in your details to get started" : "Enter the OTP sent to your email",
    forgot: fpStep === 1 ? "Enter your email to receive a reset OTP" : `OTP sent to ${fpEmail}`,
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◆</span>
            <span className={styles.logoText}>PortfolioOS</span>
          </div>
          <h1 className={styles.title}>{titles[mode]}</h1>
          <p className={styles.subtitle}>{subtitles[mode]}</p>
        </div>

        {/* Error banner */}
        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        {/* ── LOGIN ─────────────────────────────────────────────────── */}
        {mode === "login" && (
          <>
            {loginStep === 1 ? (
              <form onSubmit={handleLoginSendOtp} className={styles.form}>
                <StepDots total={2} active={1} />
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email" className={styles.input}
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required autoFocus
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <><span className={styles.spinner} /> Sending OTP…</> : "Send OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginVerifyOtp} className={styles.form}>
                <StepDots total={2} active={2} />
                <OtpHint email={loginEmail} />
                <div className={styles.field}>
                  <label className={styles.label}>6-Digit OTP Code</label>
                  <input
                    type="text" inputMode="numeric" className={styles.otpInput}
                    placeholder="— — — — — —"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6} required autoFocus
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading || loginOtp.length !== 6}>
                  {loading ? <><span className={styles.spinner} /> Verifying…</> : "Verify & Sign In →"}
                </button>
                <div className={styles.helperRow}>
                  <button type="button" className={styles.linkBtn} onClick={handleResendLoginOtp} disabled={loading}>
                    Resend OTP
                  </button>
                  <span>·</span>
                  <button type="button" className={styles.linkBtnMuted} onClick={() => { setLoginStep(1); setLoginOtp(""); setError(""); }}>
                    Change email
                  </button>
                </div>
              </form>
            )}

            <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <button type="button" className={styles.linkBtn}
                onClick={() => { reset("forgot"); setFpEmail(loginEmail); }}>
                Forgot password?
              </button>
              <button type="button" className={styles.outlineBtn} onClick={() => reset("signup")}>
                Don't have an account? Sign up
              </button>
            </div>
          </>
        )}

        {/* ── SIGNUP ────────────────────────────────────────────────── */}
        {mode === "signup" && (
          <>
            {signupStep === 1 ? (
              <form onSubmit={handleSignupSendOtp} className={styles.form}>
                <StepDots total={2} active={1} />
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <input type="text" className={styles.input} placeholder="Your Name"
                    value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Username</label>
                  <input type="text" className={styles.input} placeholder="your-username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required pattern="[a-z0-9-]+" minLength={3} maxLength={30}
                    title="Lowercase letters, numbers, and hyphens only" />
                  {signupUsername && (
                    <small style={{ color: "#4e6280", fontSize: "0.78rem" }}>
                      Portfolio: <strong style={{ color: "#a78bfa" }}>
                        {typeof window !== "undefined" ? window.location.host : "yoursite.com"}/{signupUsername}
                      </strong>
                    </small>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input type="email" className={styles.input} placeholder="you@example.com"
                    value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input type="password" className={styles.input} placeholder="••••••••"
                    value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <><span className={styles.spinner} /> Sending OTP…</> : "Send Verification OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupVerify} className={styles.form}>
                <StepDots total={2} active={2} />
                <OtpHint email={signupEmail} />
                <div className={styles.field}>
                  <label className={styles.label}>Verification OTP</label>
                  <input
                    type="text" inputMode="numeric" className={styles.otpInput}
                    placeholder="— — — — — —"
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6} required autoFocus
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading || signupOtp.length !== 6}>
                  {loading ? <><span className={styles.spinner} /> Creating account…</> : "Verify & Create Account →"}
                </button>
                <div className={styles.helperRow}>
                  <button type="button" className={styles.linkBtn}
                    onClick={() => { setSignupStep(1); setSignupOtp(""); setError(""); }}>
                    Resend OTP
                  </button>
                  <span>·</span>
                  <button type="button" className={styles.linkBtnMuted}
                    onClick={() => { setSignupStep(1); setSignupOtp(""); setError(""); }}>
                    Change details
                  </button>
                </div>
              </form>
            )}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button type="button" className={styles.outlineBtn} onClick={() => reset("login")}>
                Already have an account? Sign in
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ───────────────────────────────────────── */}
        {mode === "forgot" && (
          <>
            {fpSuccess ? (
              <>
                <div className={styles.successBox}>
                  ✅ Password reset successfully! You can now sign in with your new password.
                </div>
                <button className={styles.submitBtn} onClick={() => reset("login")}>
                  Back to Sign In →
                </button>
              </>
            ) : fpStep === 1 ? (
              <form onSubmit={handleFpSendOtp} className={styles.form}>
                <StepDots total={2} active={1} />
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input type="email" className={styles.input} placeholder="you@example.com"
                    value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <><span className={styles.spinner} /> Sending OTP…</> : "Send Reset OTP →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFpReset} className={styles.form}>
                <StepDots total={2} active={2} />
                <OtpHint email={fpEmail} />
                <div className={styles.field}>
                  <label className={styles.label}>Reset OTP</label>
                  <input
                    type="text" inputMode="numeric" className={styles.otpInput}
                    placeholder="— — — — — —"
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6} required autoFocus
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>New Password</label>
                  <input type="password" className={styles.input} placeholder="••••••••"
                    value={fpPassword} onChange={(e) => setFpPassword(e.target.value)} required minLength={6} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirm Password</label>
                  <input type="password" className={styles.input} placeholder="••••••••"
                    value={fpConfirm} onChange={(e) => setFpConfirm(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading || fpOtp.length !== 6}>
                  {loading ? <><span className={styles.spinner} /> Resetting…</> : "Reset Password →"}
                </button>
                <div className={styles.helperRow}>
                  <button type="button" className={styles.linkBtn}
                    onClick={() => { setFpStep(1); setFpOtp(""); setError(""); }}>
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
            {!fpSuccess && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button type="button" className={styles.linkBtnMuted} onClick={() => reset("login")}>
                  ← Back to Sign In
                </button>
              </div>
            )}
          </>
        )}

        <a href="/" className={styles.backLink}>← Back to Home</a>
      </div>
    </div>
  );
}
