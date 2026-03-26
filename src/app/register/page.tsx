"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "../admin/login/login.module.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    identifier: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = formData.identifier.includes("@");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.name || !formData.identifier || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-send", email: formData.identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otpCode: isEmail ? otpCode : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto-login and redirect to admin panel
      const result = await signIn("credentials", {
        identifier: formData.identifier,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! Please log in.");
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
            <span className={styles.logoIcon}>◆</span>
            <span className={styles.logoText}>PortfolioOS</span>
          </div>
          <h1 className={styles.title}>Create Your Portfolio</h1>
          <p className={styles.subtitle}>
            {step === "otp"
              ? `Enter the OTP sent to ${formData.identifier}`
              : "Join and build your professional portfolio"}
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {step === "form" && (
          <form onSubmit={isEmail ? handleSendOtp : handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                className={styles.input}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your-username"
                required
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens"
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "-4px" }}>
                Your portfolio URL:{" "}
                <strong style={{ color: "#a78bfa" }}>
                  {typeof window !== "undefined" ? window.location.host : "yoursite.com"}/
                  {formData.username || "your-username"}
                </strong>
              </small>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email or Phone</label>
              <input
                type="text"
                className={styles.input}
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="you@example.com or +91..."
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  {isEmail ? "Sending OTP..." : "Creating Account..."}
                </>
              ) : isEmail ? (
                "Send OTP & Continue"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>OTP Code</label>
              <input
                type="text"
                className={styles.input}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                autoFocus
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "-4px" }}>
                Check your inbox at <strong style={{ color: "#a78bfa" }}>{formData.identifier}</strong>. Valid for 10 minutes.
              </small>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Creating Account...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep("form"); setOtpCode(""); setError(""); }}
              style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", marginTop: "8px", fontSize: "0.9rem" }}
            >
              ← Back to edit details
            </button>
          </form>
        )}

        <a href="/admin/login" className={styles.backLink}>
          Already have an account? Login here
        </a>
      </div>
    </div>
  );
}
