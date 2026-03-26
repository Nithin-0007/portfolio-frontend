"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function AdminLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-send", email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to send OTP");
      } else {
        setForgotStep(2);
      }
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (forgotNewPassword !== forgotConfirm) {
      setForgotError("Passwords do not match");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-verify", email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to reset password");
      } else {
        setForgotSuccess(true);
      }
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotState = () => {
    setIsForgotPassword(false);
    setForgotStep(1);
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirm("");
    setForgotError("");
    setForgotSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email/phone or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Something went wrong during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register");
        setLoading(false);
        return;
      }

      // Auto-login after signup
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created, but automatic sign-in failed. Please login manually.");
        setIsLogin(true);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during signup");
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGlow1} />
        <div className={styles.bgGlow2} />

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>◆</span>
              <span className={styles.logoText}>PortfolioOS</span>
            </div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              {forgotStep === 1 ? "Enter your email to receive an OTP" : `OTP sent to ${forgotEmail}`}
            </p>
          </div>

          {forgotSuccess ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 10,
                padding: "16px",
                color: "#86efac",
                fontSize: "0.9rem",
                marginBottom: 24,
              }}>
                Password reset successfully! You can now sign in with your new password.
              </div>
              <button
                className={styles.submitBtn}
                onClick={resetForgotState}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {forgotError && <div className={styles.errorBanner}>⚠️ {forgotError}</div>}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSend} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                    {forgotLoading ? (
                      <><span className={styles.spinner} /> Sending OTP...</>
                    ) : (
                      "Send OTP →"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotVerify} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>OTP Code</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter 6-digit OTP"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>New Password</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Confirm Password</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      value={forgotConfirm}
                      onChange={(e) => setForgotConfirm(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                    {forgotLoading ? (
                      <><span className={styles.spinner} /> Resetting...</>
                    ) : (
                      "Reset Password →"
                    )}
                  </button>

                  <div style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(""); setForgotOtp(""); }}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <button
            onClick={resetForgotState}
            style={{ display: "block", textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "#475569", background: "none", border: "none", cursor: "pointer", width: "100%" }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◆</span>
            <span className={styles.logoText}>PortfolioOS</span>
          </div>
          <h1 className={styles.title}>{isLogin ? "Welcome Back" : "Join the Project"}</h1>
          <p className={styles.subtitle}>
            {isLogin ? "Sign in to manage your portfolio" : "Create an account to get started"}
          </p>
        </div>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className={styles.form}>
          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nithish Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                className={styles.input}
                placeholder="your-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                required
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens"
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "-4px" }}>
                Your portfolio URL: <strong style={{ color: "#a78bfa" }}>{typeof window !== "undefined" ? window.location.host : "yoursite.com"}/{username || "your-username"}</strong>
              </small>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email or Phone</label>
            <input
              type="text"
              className={styles.input}
              placeholder="you@example.com or +91..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label}>Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setForgotEmail(identifier.includes("@") ? identifier : ""); }}
                  style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: "0.78rem", padding: 0 }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} /> {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>{isLogin ? "Sign In →" : "Create Account"}</>
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "0.85rem",
                textDecoration: "underline",
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>

        <a href="/" className={styles.backLink}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
