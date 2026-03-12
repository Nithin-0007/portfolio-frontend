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
      if (!res.ok) throw new Error(data.error || "Failed to register");

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

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>&lt;</span>
            <span className={styles.logoText}>NR</span>
            <span className={styles.logoIcon}>/&gt;</span>
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
                placeholder="nithish_kumar"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                required
              />
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
            <label className={styles.label}>Password</label>
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
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
