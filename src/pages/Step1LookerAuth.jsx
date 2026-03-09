import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ── Icons ── */
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 7.5a3 3 0 004.243 0l2-2a3 3 0 00-4.243-4.243L6.5 2.257" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8.5 6.5a3 3 0 00-4.243 0l-2 2a3 3 0 004.243 4.243L7.5 11.743" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.5 7.5L12 12M9.5 9.5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="9.5" r="1" fill="currentColor"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4.5L12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M6 1L2 3v3.2c0 2.18 1.72 4.22 4 4.8 2.28-.58 4-2.62 4-4.8V3L6 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M4 6l1.5 1.5L8 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DatabaseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <ellipse cx="14" cy="7" rx="8" ry="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M6 7v7c0 1.657 3.582 3 8 3s8-1.343 8-3V7" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M6 14v7c0 1.657 3.582 3 8 3s8-1.343 8-3v-7" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

export default function Step1LookerAuth({ setLookerCreds }) {
  const [form, setForm] = useState({ url: "", id: "", secret: "" });
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const next = () => {
    if (!form.url || !form.id || !form.secret) return;
    setLookerCreds(form);
    navigate("/dashboards");
  };

  const handleKey = (e) => { if (e.key === "Enter") next(); };
  const isValid = form.url.trim() && form.id.trim() && form.secret.trim();

  const fields = [
    { key: "url",    label: "Looker Instance URL", placeholder: "https://company.looker.com", type: "text",     icon: <LinkIcon /> },
    { key: "id",     label: "Client ID",            placeholder: "API Client ID",             type: "text",     icon: <KeyIcon />  },
    { key: "secret", label: "Client Secret",        placeholder: "API Client Secret",         type: "password", icon: <LockIcon /> },
  ];

  return (
    /* Outer: scrollable so nothing ever gets clipped on short viewports */
    <div style={{
      flex: 1,
      overflowY: "auto",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "clamp(1rem, 3vw, 1.75rem) clamp(1rem, 4vw, 2rem)",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 440 }}
      >

        {/* ── Hero header (compact) ── */}
        <div style={{ textAlign: "center", marginBottom: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.7rem" }}>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 56, height: 56,
                background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(129,140,248,0.16))",
                border: "1.5px solid rgba(99,102,241,0.2)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--violet)",
                boxShadow: "0 6px 20px rgba(99,102,241,0.14)",
              }}
            >
              <DatabaseIcon />
            </motion.div>
          </div>

          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.25rem, 4vw, 1.6rem)",
            color: "var(--text-primary)",
            margin: "0 0 0.3rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Connect to Looker
          </h1>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Enter your API credentials to fetch available dashboards
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          borderRadius: 20,
          padding: "clamp(1.2rem, 3.5vw, 1.7rem)",
          boxShadow: "0 12px 40px rgba(99,102,241,0.1), 0 4px 12px rgba(15,23,42,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -28, right: -28, width: 110, height: 110, background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -18, left: -18, width: 90, height: 90, background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Step pill */}
          <div style={{ marginBottom: "1.1rem" }}>
            {/* <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--violet-dim)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: 99,
              padding: "0.2rem 0.65rem",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", animation: "dotPulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--violet)" }}>
                Step 1 of 3
              </span>
            </div> */}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: focused === f.key ? "var(--violet)" : "var(--text-secondary)", transition: "color 0.2s" }}>
                    {f.icon}
                  </span>
                  {f.label}
                </label>
                <input
                  className="fancy-input"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  onKeyDown={handleKey}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused("")}
                  autoComplete={f.type === "password" ? "new-password" : "off"}
                />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ margin: "1.1rem 0", height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)" }} />

          {/* CTA Button — always fully visible */}
          <button onClick={next} disabled={!isValid} className="btn-primary">
            Fetch Dashboards
            <ArrowIcon />
          </button>

          {/* Security note */}
          <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: "var(--text-muted)", fontSize: "0.68rem" }}>
            <ShieldIcon />
            Credentials used only locally — never stored
          </div>
        </div>

      </motion.div>
    </div>
  );
}