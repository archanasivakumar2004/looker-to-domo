import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { migrateDashboard } from "../services/api";

const API_BASE = "http://localhost:8000";
const previewCache = new Map();

/* ── Icons ── */
const BackIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M9 2.5L4.5 6.5 9 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const MapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M5.5 1.5L1.5 3.5v10l4-2 4 2 4-2v-10l-4 2-4-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 1.5v10M9.5 3.5v10" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);
const BarChartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 13V8M6 13V4M10 13V6M14 13V2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="4.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 5.5h3M7.5 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const TokenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5L12 4.5v5L7 12.5 2 9.5v-5L7 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M7 4v6M4.5 5.5l5 3M9.5 5.5l-5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CookieIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="5" cy="6" r="0.8" fill="currentColor"/>
    <circle cx="8.5" cy="5" r="0.8" fill="currentColor"/>
    <circle cx="7" cy="9" r="0.8" fill="currentColor"/>
    <circle cx="4.5" cy="8.5" r="0.6" fill="currentColor"/>
    <circle cx="9.5" cy="8" r="0.6" fill="currentColor"/>
  </svg>
);
const AlertCircleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.5 5v4M8.5 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M9 1.5L3 8.5h5.5L6 13.5l6-7.5H6.5L9 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
  </svg>
);
const CalcIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M3.5 4h5M3.5 6h3M3.5 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const FxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 2h5a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M2 7h5M5 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M8 9l4 4M12 9l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const LookerIcon = ({ size = 60 }) => (
  <img src="/looker-logo.png" alt="Looker" style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
);
const DomoIcon = ({ size = 45 }) => (
  <img src="/domo-logo.png" alt="Domo" style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
);

/* ── Custom Checkbox ── */
function CustomCheckbox({ checked, onChange }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 16, height: 16, borderRadius: 5,
        background: checked ? "linear-gradient(135deg, #6366f1, #818cf8)" : "white",
        border: checked ? "1.5px solid #6366f1" : "1.5px solid var(--border-strong)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
        boxShadow: checked ? "0 2px 8px rgba(99,102,241,0.3)" : "inset 0 1px 2px rgba(15,23,42,0.06)",
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   CALCULATION POPUP — PERFECTLY CENTERED
   KEY FIX: use transformTemplate to combine
   the centering translate with framer motion's
   own transform so they don't cancel each other
════════════════════════════════════════ */
function CalcPopup({ viz, calculatedFields, onClose }) {
  if (!viz) return null;

  const cfMap = {};
  (calculatedFields || []).forEach(cf => { cfMap[cf.name] = cf; });

  const formulas = [];
  const seen = new Set();

  const addFormula = (fieldName) => {
    if (!fieldName || seen.has(fieldName)) return;
    const cf = cfMap[fieldName];
    if (cf) {
      seen.add(fieldName);
      formulas.push({
        key: fieldName,
        label: cf.label || cf.name,
        beast_mode: cf.beast_mode || "",
        category: cf.category || "",
        is_disabled: cf.is_disabled || false,
      });
    }
  };

  (viz.columns || []).forEach(c => { if (c.is_calc || cfMap[c.field]) addFormula(c.field); });
  (viz.measures || []).forEach(m => { if (m.is_calc || cfMap[m.column]) addFormula(m.column); });
  if (formulas.length === 0) {
    (viz.measures || []).forEach(m => addFormula(m.column));
    (viz.columns  || []).forEach(c => addFormula(c.field));
  }

  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: "rgba(8,10,30,0.55)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
        }}
      />

      {/* ── Popup — FIXED CENTER ──
          The trick: DO NOT use y/x in animate because Framer Motion
          builds its own transform string and overwrites translate(-50%,-50%).
          Instead we animate opacity + scale only, and keep the centering
          purely in the style prop using left/top + margin trick.
      ── */}
      <motion.div
        key="popup"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1,  scale: 1    }}
        exit={{   opacity: 0,  scale: 0.92  }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          /* ── Centering: fixed + top/left 50% + negative margin ── */
          position: "fixed",
          top: "50%",
          left: "50%",
          marginTop: "-160px",   /* half of approx height → vertical center */
          marginLeft: "-210px",  /* half of width 420px → horizontal center */

          zIndex: 9999,
          width: 420,
          maxWidth: "calc(100vw - 32px)",

          /* compact height */
          maxHeight: "440px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",

          borderRadius: 16,
          background: "linear-gradient(160deg, #ffffff 0%, #f3f4ff 100%)",
          border: "1.5px solid rgba(129,140,248,0.35)",
          boxShadow: [
            "0 0 0 1px rgba(99,102,241,0.12)",
            "0 8px 20px rgba(99,102,241,0.18)",
            "0 24px 60px rgba(15,23,42,0.32)",
            "inset 0 1px 0 rgba(255,255,255,0.9)",
          ].join(", "),
        }}
      >
        {/* Top prismatic bar */}
        <div style={{
          height: 3, flexShrink: 0,
          background: "linear-gradient(90deg, #4f46e5 0%, #6366f1 30%, #818cf8 65%, #a5b4fc 90%, transparent 100%)",
          boxShadow: "0 1px 10px rgba(99,102,241,0.5)",
        }} />

        {/* Dot grid watermark */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          maskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
        }} />

        {/* ── HEADER ── */}
        <div style={{
          position: "relative", zIndex: 1, flexShrink: 0,
          padding: "0.65rem 0.85rem",
          borderBottom: "1px solid rgba(99,102,241,0.1)",
          background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(129,140,248,0.02) 100%)",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          {/* FX badge */}
          <div style={{
            width: 30, height: 30, flexShrink: 0, borderRadius: 8,
            background: "linear-gradient(135deg, #5b5ef4, #818cf8)",
            boxShadow: "0 3px 10px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
          }}>
            <FxIcon />
          </div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: "0.82rem",
              color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>
              Beast Mode Calculations
            </div>
            <div style={{
              marginTop: 2,
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.63rem", color: "#94a3b8",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} title={viz.title}>
              {viz.title || "Untitled"}{"  "}
              <span style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#6366f1", borderRadius: 4,
                padding: "0 4px", fontSize: "0.56rem",
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {viz.type}
              </span>
            </div>
          </div>

          {/* ✕ close */}
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, flexShrink: 0, borderRadius: 6,
              border: "1.5px solid rgba(99,102,241,0.2)",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 1px 6px rgba(15,23,42,0.1)",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#94a3b8",
              transition: "all 0.15s", padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(244,63,94,0.08)";
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)";
              e.currentTarget.style.color = "#e11d48";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.85)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── FORMULA LIST ── */}
        <div
          className="hide-scrollbar"
          style={{
            position: "relative", zIndex: 1,
            flex: 1, overflowY: "auto",
            padding: "0.65rem 0.85rem",
            display: "flex", flexDirection: "column", gap: "0.5rem",
          }}
        >
          {formulas.length === 0 ? (
            /* Empty state — compact */
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "0.5rem", padding: "1.8rem 1rem", textAlign: "center",
            }}>
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="17" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="5 3"/>
                <path d="M13 20h14M20 13v14" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{
                margin: 0, fontSize: "0.76rem", color: "#64748b",
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600,
              }}>
                No calculations for this chart
              </p>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8", lineHeight: 1.5 }}>
                Uses only base dataset columns.
              </p>
            </div>
          ) : formulas.map((f, idx) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.18 }}
              style={{
                borderRadius: 10, overflow: "hidden",
                border: "1.5px solid rgba(99,102,241,0.13)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
                background: "white",
              }}
            >
              {/* Label row */}
              <div style={{
                padding: "0.38rem 0.65rem",
                background: "linear-gradient(90deg, rgba(99,102,241,0.05), transparent)",
                borderBottom: "1px solid rgba(99,102,241,0.08)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                  boxShadow: "0 0 4px rgba(99,102,241,0.5)",
                }} />
                <span style={{
                  flex: 1,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700, fontSize: "0.7rem", color: "#0f172a",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }} title={f.label}>
                  {f.label}
                </span>
                <span style={{
                  fontSize: "0.55rem",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", borderRadius: 4,
                  padding: "0.06rem 0.3rem", flexShrink: 0,
                  background: f.category === "table_calculation" ? "rgba(245,158,11,0.09)" : "rgba(99,102,241,0.09)",
                  border: `1px solid ${f.category === "table_calculation" ? "rgba(245,158,11,0.28)" : "rgba(99,102,241,0.22)"}`,
                  color: f.category === "table_calculation" ? "#d97706" : "#6366f1",
                }}>
                  {f.category === "table_calculation" ? "Table Calc" : "Measure"}
                </span>
                {f.is_disabled && (
                  <span style={{
                    fontSize: "0.55rem", fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.22)",
                    color: "#e11d48", borderRadius: 4, padding: "0.06rem 0.3rem", flexShrink: 0,
                  }}>Disabled</span>
                )}
              </div>

              {/* SQL */}
              <div style={{ padding: "0.45rem 0.65rem" }}>
                <div style={{
                  fontSize: "0.55rem",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700, letterSpacing: "0.09em",
                  textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.22rem",
                }}>
                  Beast Mode SQL
                </div>
                <pre style={{
                  margin: 0, fontFamily: "monospace", fontSize: "0.72rem",
                  color: "#3730a3", lineHeight: 1.65,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(129,140,248,0.02))",
                  border: "1px solid rgba(99,102,241,0.12)",
                  borderRadius: 7, padding: "0.45rem 0.65rem",
                  whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}>
                  {f.beast_mode || "(empty)"}
                </pre>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          position: "relative", zIndex: 1, flexShrink: 0,
          padding: "0.45rem 0.85rem",
          borderTop: "1px solid rgba(99,102,241,0.1)",
          background: "linear-gradient(135deg, rgba(99,102,241,0.03), transparent)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontFamily: "'Outfit', sans-serif" }}>
            <span style={{ fontWeight: 700, color: "#6366f1" }}>{formulas.length}</span>
            {" "}calc{formulas.length !== 1 ? "s" : ""} · {viz.type}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #5b5ef4, #818cf8)",
              border: "none", color: "white", borderRadius: 7,
              padding: "0.28rem 0.85rem", cursor: "pointer",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700, fontSize: "0.68rem",
              boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(99,102,241,0.35)";
              e.currentTarget.style.transform = "none";
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ── Pipeline Transfer Loader ── */
function TransferLoader({ label, subtitle }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(8);
  const messages = ["Transferring dashboard structure…", "Mapping Looker views to Domo…", "Building Domo cards…", "Almost done…"];
  const steps = ["Authenticating", "Transferring Data", "Building Cards", "Finalising"];
  useEffect(() => {
    const mt = setInterval(() => setMsgIdx(p => (p + 1) % messages.length), 2200);
    const st = setInterval(() => {
      setStepIdx(p => { if (p < steps.length - 1) { setProgress(pp => Math.min(pp + 22, 92)); return p + 1; } return p; });
    }, 3000);
    return () => { clearInterval(mt); clearInterval(st); };
  }, []);
  const barHeights = [20, 34, 26, 40, 30, 36];
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 620, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: 24, padding: "clamp(1.5rem, 4vw, 2.2rem)", boxShadow: "0 12px 40px rgba(99,102,241,0.1), 0 4px 12px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: "1.6rem" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "var(--text-primary)", margin: "0 0 0.3rem", letterSpacing: "-0.01em" }}>{label || "Processing…"}</h2>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>{subtitle || "Please wait…"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.75rem, 2vw, 1.25rem)" }}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <LookerIcon size={70} />
          </motion.div>
          <div style={{ flex: 1, height: 130, borderRadius: 16, background: "rgba(248,249,254,0.9)", border: "1px solid var(--border)", boxShadow: "inset 0 2px 8px rgba(99,102,241,0.05)", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} viewBox="0 0 300 130">
              {[...Array(8)].map((_, i) => <line key={i} x1="0" x2="300" y1={i * 17} y2={i * 17} stroke="#94a3b8" strokeWidth="0.5" />)}
              {[...Array(13)].map((_, i) => <line key={"v"+i} y1="0" y2="130" x1={i * 25} x2={i * 25} stroke="#94a3b8" strokeWidth="0.5" />)}
            </svg>
            <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(129,140,248,0.07) 50%, rgba(16,185,129,0.04) 100%)" }} />
            <motion.svg viewBox="0 0 300 130" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 12 }}>
              <motion.path d="M0 95 L40 78 L80 82 L120 62 L160 66 L200 50 L240 53 L280 38" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
            </motion.svg>
            <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "flex-end", gap: 3 }}>
              {barHeights.map((h, i) => (
                <motion.div key={i} style={{ width: 6, borderRadius: 3, background: "linear-gradient(180deg, #818cf8, #6366f1)" }} animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 1.5, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }} initial={{ height: h, transformOrigin: "bottom" }} />
              ))}
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", top: 12, right: 14 }}>
              <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" stroke="#10b981" strokeWidth="5" fill="none" strokeDasharray="44 18" /></svg>
            </motion.div>
            {[0, 1, 2].map(i => (
              <motion.div key={i} style={{ position: "absolute", top: 16 + i * 32, left: -44, width: 44, height: 28, background: "white", borderRadius: 8, border: "1px solid rgba(99,102,241,0.18)", boxShadow: "0 2px 8px rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }} animate={{ x: [0, 320], opacity: [0, 1, 1, 0] }} transition={{ duration: 3.8, delay: i * 1.1, repeat: Infinity, ease: "linear" }}>
                <svg width="26" height="14" viewBox="0 0 26 14"><polyline points="0,12 5,8 10,9 15,5 20,6 26,2" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            ))}
          </div>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <DomoIcon size={50} />
          </motion.div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: 99 }} />
          </div>
          <motion.p key={messages[msgIdx]} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>{messages[msgIdx]}</motion.p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0.45rem 0.7rem", borderRadius: 10, background: i === stepIdx ? "rgba(99,102,241,0.07)" : i < stepIdx ? "rgba(16,185,129,0.06)" : "transparent", border: `1px solid ${i === stepIdx ? "rgba(99,102,241,0.18)" : i < stepIdx ? "rgba(16,185,129,0.15)" : "transparent"}`, transition: "all 0.3s" }}>
              {i < stepIdx ? (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.2"/><path d="M4 6.5l2 2 3-3" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>)
              : i === stepIdx ? (<motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--violet)", flexShrink: 0 }} />)
              : (<div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} />)}
              <span style={{ fontSize: "0.72rem", fontFamily: "'Outfit', sans-serif", fontWeight: 500, color: i === stepIdx ? "var(--violet)" : i < stepIdx ? "#10b981" : "var(--text-muted)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Success Page ── */
function SuccessPage({ onGoToDashboard }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 460, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1.5px solid rgba(255,255,255,0.98)", borderRadius: 28, padding: "clamp(2rem, 5vw, 2.8rem)", boxShadow: "0 16px 48px rgba(16,185,129,0.12), 0 4px 16px rgba(15,23,42,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.6rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LookerIcon size={70} />
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} style={{ color: "#10b981" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.div>
          <DomoIcon size={45} />
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
          style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.05))", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 8px rgba(16,185,129,0.06)" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <motion.path d="M8 16l6 6 10-11" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5 }} />
          </svg>
        </motion.div>
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", color: "var(--text-primary)", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>Dashboard Migrated Successfully</h2>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>Your selected Looker charts have been transferred to Domo. All cards and datasets are ready.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onGoToDashboard}
          style={{ width: "100%", padding: "0.88rem 1.4rem", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 14, cursor: "pointer", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "white", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9"/><rect x="9.5" y="1.5" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.9"/></svg>
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ── Section Card ── */
const SectionCard = ({ number, title, icon, children }) => (
  <div style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 2px 6px rgba(15,23,42,0.04)" }}>
    <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(129,140,248,0.02) 100%)" }}>
      <div style={{ width: 28, height: 28, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 1 }}>{number}</div>
      </div>
    </div>
    <div style={{ padding: "1rem 1.15rem" }}>{children}</div>
  </div>
);

/* ── Inline field error ── */
const FieldError = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: "0.71rem", color: "#e11d48", fontFamily: "'Outfit', sans-serif" }}>
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#e11d48" strokeWidth="1.2"/><path d="M5.5 3v3M5.5 7.5v.5" stroke="#e11d48" strokeWidth="1.2" strokeLinecap="round"/></svg>
    {msg}
  </motion.div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Step3Migrate({ lookerCreds, selectedDash }) {
  const navigate = useNavigate();
  const [domoForm, setDomoForm] = useState({ pageId: "", csrf: "", cookie: "" });
  const [resolvedMappings, setResolvedMappings] = useState({});
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [mappingErrors, setMappingErrors] = useState({});
  const [selectedVisualIds, setSelectedVisualIds] = useState(new Set());
  const [popupViz, setPopupViz] = useState(null);

  const initCacheKey = lookerCreds && selectedDash ? `${lookerCreds.url}__${selectedDash.id}` : null;
  const initCached = initCacheKey ? previewCache.get(initCacheKey) : null;
  const [loading, setLoading] = useState(!initCached);
  const [dashboardTitle, setDashboardTitle] = useState(initCached?.dashboard_name || selectedDash?.title || "");
  const [lookerViews, setLookerViews] = useState(initCached?.looker_datasets || []);
  const [visuals, setVisuals] = useState(initCached?.visuals || []);
  const [calculatedFields, setCalculatedFields] = useState(initCached?.calculatedFields || []);

  useEffect(() => {
    if (!lookerCreds || !selectedDash) { navigate("/"); return; }
    const cacheKey = `${lookerCreds.url}__${selectedDash.id}`;
    if (previewCache.has(cacheKey)) {
      const c = previewCache.get(cacheKey);
      setDashboardTitle(c.dashboard_name || selectedDash.title);
      setLookerViews(c.looker_datasets || []);
      setVisuals(c.visuals || []);
      setCalculatedFields(c.calculatedFields || []);
      setSelectedVisualIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.post(`${API_BASE}/looker/preview`, {
      looker_url: lookerCreds.url, looker_id: selectedDash.id,
      looker_client_id: lookerCreds.id, looker_client_secret: lookerCreds.secret,
    })
    .then((res) => {
      previewCache.set(cacheKey, res.data);
      setDashboardTitle(res.data.dashboard_name || selectedDash.title);
      setLookerViews(res.data.looker_datasets || []);
      setVisuals(res.data.visuals || []);
      setCalculatedFields(res.data.calculatedFields || []);
      setSelectedVisualIds(new Set());
    })
    .catch(err => console.error("Preview error:", err))
    .finally(() => setLoading(false));
  }, [lookerCreds?.url, lookerCreds?.id, selectedDash?.id]);

  const toggleVisual = (id) => {
    setSelectedVisualIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const executeMigration = async () => {
    const fErrs = {};
    if (!domoForm.pageId.trim()) fErrs.pageId = "Page ID is required.";
    if (!domoForm.csrf.trim())   fErrs.csrf   = "CSRF Token is required.";
    if (!domoForm.cookie.trim()) fErrs.cookie  = "Session cookies are required.";
    setFieldErrors(fErrs);

    const mErrs = {};
    lookerViews.forEach(v => {
      if (!resolvedMappings[v.name]?.trim()) mErrs[v.name] = "Please enter the Dataset UUID.";
    });
    setMappingErrors(mErrs);

    if (Object.keys(fErrs).length > 0 || Object.keys(mErrs).length > 0) return;

    const selectedIds = [...selectedVisualIds];
    if (selectedIds.length === 0) {
      setStatus("error:No charts selected. Please check at least one chart to migrate.");
      return;
    }

    setStatus("loading");
    try {
      await migrateDashboard({
        looker_url: lookerCreds.url, looker_client_id: lookerCreds.id,
        looker_client_secret: lookerCreds.secret, looker_id: selectedDash.id,
        domo_page_id: domoForm.pageId, domo_cookie: domoForm.cookie,
        domo_csrf: domoForm.csrf, dataset_mapping: resolvedMappings,
        selected_visual_ids: selectedIds,
      });
      setStatus("success");
    } catch (err) {
      const detail = err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : err.message;
      setStatus("error:" + detail);
    }
  };

  if (!selectedDash) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No dashboard selected.</p>
        <button onClick={() => navigate("/dashboards")} className="btn-primary" style={{ width: "auto", padding: "0.6rem 1.4rem" }}>Back to Dashboards</button>
      </div>
    );
  }
  if (loading) return <TransferLoader label="Scanning Dashboard" subtitle="Reading charts, datasets and layout from Looker…" />;
  if (status === "loading") return <TransferLoader label="Migrating to Domo" subtitle="Transferring your selected charts and datasets…" />;
  if (status === "success") return <SuccessPage onGoToDashboard={() => navigate("/dashboards")} />;

  const isError = status.startsWith("error:");
  const errorMsg = isError ? status.replace("error:", "") : "";

  const setDomoField = (key, val) => {
    setDomoForm(p => ({ ...p, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };
  const setMapping = (name, val) => {
    setResolvedMappings(p => ({ ...p, [name]: val }));
    if (mappingErrors[name]) setMappingErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const selectedCount = selectedVisualIds.size;
  const selectableCount = visuals.filter(v => v.type !== "TEXT").length;

  return (
    <>
      {/* ── Centered Popup (AnimatePresence for smooth enter/exit) ── */}
      <AnimatePresence>
        {popupViz && (
          <CalcPopup
            viz={popupViz}
            calculatedFields={calculatedFields}
            onClose={() => setPopupViz(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)" }}
      >
        <div style={{ flexShrink: 0, marginBottom: "0.7rem" }}>
          <button onClick={() => navigate("/dashboards")}
            style={{ background: "none", border: "none", padding: "0.2rem 0", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "'Outfit', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "color 0.18s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--violet)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <BackIcon /> Back to Dashboards
          </button>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 660, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.9rem", paddingBottom: "2rem" }}>

            {/* Page header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "0.2rem 0.65rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", animation: "dotPulse 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--violet)" }}>Step 3 of 3</span>
              </div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.15rem, 3vw, 1.45rem)", color: "var(--text-primary)", margin: "0 0 0.5rem", letterSpacing: "-0.01em" }}>
                Configure &amp; Migrate
              </h2>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.88)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "0.5rem 0.85rem", boxShadow: "0 2px 10px rgba(99,102,241,0.06)" }}>
                <div style={{ color: "var(--violet)", display: "flex" }}><DashboardIcon /></div>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "var(--text-primary)", maxWidth: "clamp(180px, 40vw, 380px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dashboardTitle}</span>
              </div>
            </div>

            {/* Section 1: Dataset Mapping */}
            <div style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 2px 6px rgba(15,23,42,0.04)" }}>
              <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(129,140,248,0.02) 100%)" }}>
                <div style={{ width: 28, height: 28, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)", flexShrink: 0 }}><MapIcon /></div>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.2 }}>Dataset Mapping</div>
                </div>
              </div>
              <div style={{ padding: "1rem 1.15rem" }}>
                <p style={{ margin: "0 0 0.9rem", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>Match each Looker view to its Domo Dataset UUID.</p>
                {lookerViews.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No Looker views detected.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {lookerViews.map((view, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.38rem" }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="8" rx="1.5" stroke="#6366f1" strokeWidth="1.3"/><path d="M4 11h5M6.5 9v2" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round"/></svg>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>View from dashboard:</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.76rem", fontWeight: 700, color: "var(--violet)", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 6, padding: "0.1rem 0.45rem", maxWidth: "clamp(140px, 35vw, 280px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={view.name}>{view.name}</span>
                        </div>
                        <input className="fancy-input" placeholder="Enter Domo Dataset UUID"
                          value={resolvedMappings[view.name] || ""}
                          onChange={e => setMapping(view.name, e.target.value)}
                          style={{ fontFamily: "monospace", fontSize: "0.76rem", background: "white", padding: "0.5rem 0.85rem", borderColor: mappingErrors[view.name] ? "#e11d48" : undefined, boxShadow: mappingErrors[view.name] ? "0 0 0 3px rgba(225,29,72,0.1)" : undefined }} />
                        <AnimatePresence>{mappingErrors[view.name] && <FieldError msg={mappingErrors[view.name]} />}</AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Charts to Migrate */}
            {visuals.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 2px 6px rgba(15,23,42,0.04)" }}>
                <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(129,140,248,0.02) 100%)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)", flexShrink: 0 }}><BarChartIcon /></div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-primary)" }}>Charts to Migrate</div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={selectedCount} initial={{ opacity: 0, scale: 0.8, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 4 }} transition={{ duration: 0.14 }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: selectedCount > 0 ? "rgba(99,102,241,0.08)" : "rgba(148,163,184,0.07)", border: `1px solid ${selectedCount > 0 ? "rgba(99,102,241,0.2)" : "rgba(148,163,184,0.15)"}`, borderRadius: 99, padding: "0.22rem 0.65rem" }}>
                      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "0.72rem", color: selectedCount > 0 ? "var(--violet)" : "var(--text-muted)" }}>{selectedCount}</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>/ {selectableCount} selected</span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div style={{ padding: "0.75rem 1.15rem 1rem" }}>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    Check charts to migrate. Click <strong>Calculation</strong> to preview Beast Mode formulas.
                  </p>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <colgroup>
                        <col style={{ width: "38px" }} />
                        <col style={{ width: "32%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "26%" }} />
                        <col style={{ width: "18%" }} />
                      </colgroup>
                      <thead>
                        <tr style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(129,140,248,0.03))", borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "0.5rem 0.6rem" }} />
                          {["Title", "Type", "Looker View", "Details"].map(h => (
                            <th key={h} style={{ padding: "0.5rem 0.7rem", textAlign: "left", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visuals.map((viz, idx) => {
                          const isText = viz.type === "TEXT";
                          const isChecked = !isText && selectedVisualIds.has(viz.id);
                          const viewName = lookerViews.find(v => v.id === viz.datasetRef)?.name || viz.datasetRef || "—";
                          const isPopupOpen = popupViz?.id === viz.id;

                          return (
                            <motion.tr
                              key={viz.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.02, duration: 0.2 }}
                              style={{
                                borderBottom: "1px solid var(--border)",
                                transition: "background 0.13s",
                                cursor: isText ? "default" : "pointer",
                                background: isPopupOpen
                                  ? "rgba(99,102,241,0.06)"
                                  : isChecked
                                  ? "rgba(99,102,241,0.035)"
                                  : "transparent",
                              }}
                              onClick={() => !isText && toggleVisual(viz.id)}
                              onMouseEnter={e => {
                                if (!isText) e.currentTarget.style.background = isChecked || isPopupOpen ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.02)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = isPopupOpen ? "rgba(99,102,241,0.06)" : isChecked ? "rgba(99,102,241,0.035)" : "transparent";
                              }}
                            >
                              <td style={{ padding: "0.5rem 0.6rem", textAlign: "center" }}>
                                {isText ? (
                                  <div style={{ width: 16, height: 16, borderRadius: 5, background: "rgba(148,163,184,0.08)", border: "1.5px solid rgba(148,163,184,0.18)", margin: "0 auto" }} />
                                ) : (
                                  <div style={{ display: "flex", justifyContent: "center" }}>
                                    <CustomCheckbox checked={isChecked} onChange={() => toggleVisual(viz.id)} />
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "0.5rem 0.7rem", fontWeight: 500, color: isText ? "var(--text-muted)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0 }}>
                                <span title={viz.title || "—"}>{viz.title || "—"}</span>
                                {isText && (
                                  <span style={{ marginLeft: 5, fontSize: "0.6rem", background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 4, padding: "0.1rem 0.35rem", color: "var(--text-muted)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>text tile</span>
                                )}
                              </td>
                              <td style={{ padding: "0.5rem 0.7rem", whiteSpace: "nowrap" }}>
                                <span style={{ background: isChecked ? "var(--violet-dim)" : "rgba(148,163,184,0.08)", border: `1px solid ${isChecked ? "rgba(99,102,241,0.18)" : "rgba(148,163,184,0.18)"}`, color: isChecked ? "var(--violet)" : "var(--text-muted)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.15rem 0.4rem", borderRadius: 6, transition: "all 0.15s" }}>{viz.type || "—"}</span>
                              </td>
                              <td style={{ padding: "0.5rem 0.7rem", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 0 }}>
                                {isText ? "—" : viewName}
                              </td>
                              <td style={{ padding: "0.4rem 0.7rem", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                                {isText ? (
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>—</span>
                                ) : (
                                  <button
                                    onClick={() => setPopupViz(isPopupOpen ? null : viz)}
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: 4,
                                      background: isPopupOpen ? "linear-gradient(135deg, #6366f1, #818cf8)" : "rgba(99,102,241,0.07)",
                                      border: `1.5px solid ${isPopupOpen ? "#6366f1" : "rgba(99,102,241,0.2)"}`,
                                      color: isPopupOpen ? "white" : "var(--violet)",
                                      borderRadius: 8, padding: "0.28rem 0.6rem",
                                      cursor: "pointer",
                                      fontFamily: "'Bricolage Grotesque', sans-serif",
                                      fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.04em",
                                      transition: "all 0.15s",
                                      boxShadow: isPopupOpen ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                                    }}
                                    onMouseEnter={e => { if (!isPopupOpen) { e.currentTarget.style.background = "rgba(99,102,241,0.14)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)"; }}}
                                    onMouseLeave={e => { if (!isPopupOpen) { e.currentTarget.style.background = "rgba(99,102,241,0.07)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}}
                                  >
                                    <CalcIcon />
                                    Calculation
                                  </button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Domo Session */}
            <SectionCard number={visuals.length > 0 ? "" : "Section 02"} title="Domo Session Details" icon={<TokenIcon />}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "var(--violet)" }}><IdIcon /></span> Target Page ID
                  </label>
                  <input className="fancy-input" placeholder="e.g. 650770219" value={domoForm.pageId} onChange={e => setDomoField("pageId", e.target.value)}
                    style={{ borderColor: fieldErrors.pageId ? "#e11d48" : undefined, boxShadow: fieldErrors.pageId ? "0 0 0 3px rgba(225,29,72,0.1)" : undefined }} />
                  <AnimatePresence>{fieldErrors.pageId && <FieldError msg={fieldErrors.pageId} />}</AnimatePresence>
                </div>
                <div>
                  <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "var(--violet)" }}><TokenIcon /></span> CSRF Token
                  </label>
                  <input className="fancy-input" placeholder="Paste x-csrf-token value" value={domoForm.csrf} onChange={e => setDomoField("csrf", e.target.value)}
                    style={{ borderColor: fieldErrors.csrf ? "#e11d48" : undefined, boxShadow: fieldErrors.csrf ? "0 0 0 3px rgba(225,29,72,0.1)" : undefined }} />
                  <AnimatePresence>{fieldErrors.csrf && <FieldError msg={fieldErrors.csrf} />}</AnimatePresence>
                </div>
                <div>
                  <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: "var(--violet)" }}><CookieIcon /></span> Session Cookies
                  </label>
                  <textarea rows={3} className="fancy-input" placeholder="Paste full cookie string from browser DevTools" value={domoForm.cookie} onChange={e => setDomoField("cookie", e.target.value)}
                    style={{ resize: "none", lineHeight: 1.5, borderColor: fieldErrors.cookie ? "#e11d48" : undefined, boxShadow: fieldErrors.cookie ? "0 0 0 3px rgba(225,29,72,0.1)" : undefined }} />
                  <AnimatePresence>{fieldErrors.cookie && <FieldError msg={fieldErrors.cookie} />}</AnimatePresence>
                </div>
              </div>
            </SectionCard>

            {/* Execute */}
            <div>
              <button onClick={executeMigration} className="btn-emerald" style={{ padding: "0.9rem 1.2rem", fontSize: "0.9rem" }}>
                <ZapIcon />
                Execute Migration
                {selectedCount > 0 && (
                  <span style={{ background: "rgba(255,255,255,0.22)", borderRadius: 99, padding: "0.1rem 0.6rem", fontSize: "0.78rem", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}>
                    {selectedCount} chart{selectedCount !== 1 ? "s" : ""}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {isError && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: "0.7rem", background: "var(--rose-dim)", border: "1.5px solid rgba(244,63,94,0.2)", borderRadius: 14, padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#e11d48" }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <AlertCircleIcon /> Migration failed
                    </span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", opacity: 0.85 }}>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </>
  );
}