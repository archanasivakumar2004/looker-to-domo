import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://localhost:8000";
const dashboardCache = new Map();

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.5 4.5v3.5M7.5 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="5" y="5" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M13 20h14M13 14h10M13 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="30" cy="30" r="7" fill="#f0f2fc" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M27.5 30h5M30 27.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const ArrowRightSmall = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6h7M6.5 3.5L9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* ── Real Logo Icons ── */
const LookerIcon = ({ size = 70 }) => (
  <img
    src="/looker-logo.png"
    alt="Looker"
    style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
  />
);
const DomoIcon = ({ size = 45 }) => (
  <img
    src="/domo-logo.png"
    alt="Domo"
    style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
  />
);

/* ── Rich Pipeline Transfer Loader ── */
function TransferLoader({ fetched, label }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(8);

  const messages = [
    "Connecting to Looker API…",
    "Scanning dashboard metadata…",
    "Mapping dimensions & measures…",
    "Streaming dashboards to view…",
    "Almost there…",
  ];
  const steps = ["Authenticating", "Fetching Metadata", "Streaming Data", "Ready"];

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
      <div style={{
        width: "100%", maxWidth: 620,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1.5px solid rgba(255,255,255,0.95)",
        borderRadius: 24,
        padding: "clamp(1.5rem, 4vw, 2.2rem)",
        boxShadow: "0 12px 40px rgba(99,102,241,0.1), 0 4px 12px rgba(15,23,42,0.06)",
        display: "flex", flexDirection: "column", gap: "1.6rem",
      }}>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "var(--text-primary)", margin: "0 0 0.3rem", letterSpacing: "-0.01em" }}>
            Looker <span style={{ color: "var(--violet)" }}>→</span> Domo
          </h2>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            {label || "Fetching your dashboards…"}
          </p>
        </div>

        {/* ── Pipeline Visualization ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.75rem, 2vw, 1.25rem)" }}>

          {/* Looker side */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}
          >
            <LookerIcon size={70} />
          </motion.div>

          {/* ── Pipeline canvas ── */}
          <div style={{
            flex: 1, height: 130, borderRadius: 16,
            background: "rgba(248,249,254,0.9)",
            border: "1px solid var(--border)",
            boxShadow: "inset 0 2px 8px rgba(99,102,241,0.05)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Grid lines */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} viewBox="0 0 300 130">
              {[...Array(8)].map((_, i) => <line key={i} x1="0" x2="300" y1={i * 17} y2={i * 17} stroke="#94a3b8" strokeWidth="0.5" />)}
              {[...Array(13)].map((_, i) => <line key={"v"+i} y1="0" y2="130" x1={i * 25} x2={i * 25} stroke="#94a3b8" strokeWidth="0.5" />)}
            </svg>

            {/* Animated gradient wash */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(129,140,248,0.07) 50%, rgba(16,185,129,0.04) 100%)" }}
            />

            {/* Growing trend line */}
            <motion.svg viewBox="0 0 300 130" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 12 }}>
              <motion.path
                d="M0 95 L40 78 L80 82 L120 62 L160 66 L200 50 L240 53 L280 38"
                fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.svg>

            {/* Area fill */}
            <motion.svg viewBox="0 0 300 130" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 12, opacity: 0.25 }}>
              <motion.path
                d="M0 110 L40 95 L80 98 L120 82 L160 86 L200 72 L240 74 L280 60 L280 130 L0 130 Z"
                fill="#6366f1"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.svg>

            {/* Animated bar cluster bottom-left */}
            <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "flex-end", gap: 3 }}>
              {barHeights.map((h, i) => (
                <motion.div
                  key={i}
                  style={{ width: 6, borderRadius: 3, background: "linear-gradient(180deg, #818cf8, #6366f1)" }}
                  animate={{ scaleY: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
                  initial={{ height: h, transformOrigin: "bottom" }}
                />
              ))}
            </div>

            {/* Rotating donut top-right */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: 12, right: 14 }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="10" stroke="#10b981" strokeWidth="5" fill="none" strokeDasharray="44 18" />
              </svg>
            </motion.div>

            {/* Moving chart cards Looker → Domo */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{
                  position: "absolute", top: 16 + i * 32, left: -44,
                  width: 44, height: 28,
                  background: "white", borderRadius: 8,
                  border: "1px solid rgba(99,102,241,0.18)",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                animate={{ x: [0, 320], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3.8, delay: i * 1.1, repeat: Infinity, ease: "linear" }}
              >
                <svg width="26" height="14" viewBox="0 0 26 14">
                  <polyline points="0,12 5,8 10,9 15,5 20,6 26,2" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            ))}

            {/* Moving bar card */}
            <motion.div
              style={{
                position: "absolute", bottom: 16, left: -48,
                background: "white", borderRadius: 8,
                border: "1px solid rgba(16,185,129,0.2)",
                boxShadow: "0 2px 8px rgba(16,185,129,0.1)",
                padding: "4px 6px",
                display: "flex", alignItems: "flex-end", gap: 2,
              }}
              animate={{ x: [0, 320], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4.5, delay: 1.4, repeat: Infinity, ease: "linear" }}
            >
              {[7, 11, 8, 13].map((h, i) => (
                <div key={i} style={{ width: 4, height: h, background: "#10b981", borderRadius: 2 }} />
              ))}
            </motion.div>
          </div>

          {/* Domo side */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}
          >
            <DomoIcon size={45} />
          </motion.div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${fetched > 0 ? Math.max(progress, 30) : progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #818cf8)", borderRadius: 99 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <motion.p
              key={messages[msgIdx]}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}
            >
              {messages[msgIdx]}
            </motion.p>
            {fetched > 0 && (
              <motion.span
                key={fetched} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--violet)", fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {fetched} found
              </motion.span>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "0.45rem 0.7rem", borderRadius: 10,
              background: i === stepIdx ? "rgba(99,102,241,0.07)" : i < stepIdx ? "rgba(16,185,129,0.06)" : "transparent",
              border: `1px solid ${i === stepIdx ? "rgba(99,102,241,0.18)" : i < stepIdx ? "rgba(16,185,129,0.15)" : "transparent"}`,
              transition: "all 0.3s",
            }}>
              {i < stepIdx ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.2"/><path d="M4 6.5l2 2 3-3" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : i === stepIdx ? (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--violet)", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} />
              )}
              <span style={{
                fontSize: "0.72rem", fontFamily: "'Outfit', sans-serif", fontWeight: 500,
                color: i === stepIdx ? "var(--violet)" : i < stepIdx ? "#10b981" : "var(--text-muted)",
              }}>{s}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function Step2DashboardList({ lookerCreds, setSelectedDash }) {
  const [dashboards, setDashboards] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [partialLoading, setPartialLoading] = useState(false);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [error, setError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 20;
  const abortRef = useRef(null);

  const cacheKey = lookerCreds ? `${lookerCreds.url}__${lookerCreds.id}` : null;

  useEffect(() => {
    if (!lookerCreds) { navigate("/"); return; }

    if (cacheKey && dashboardCache.has(cacheKey)) {
      setDashboards(dashboardCache.get(cacheKey));
      return;
    }

    setLoading(true);
    setPartialLoading(true);
    setFetchedCount(0);
    setError("");
    setDashboards([]);

    const controller = new AbortController();
    abortRef.current = controller;

    const credentials = {
      looker_url: lookerCreds.url,
      looker_client_id: lookerCreds.id,
      looker_client_secret: lookerCreds.secret,
    };

    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/looker/dashboards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = [];
        let shownTable = false;

        const flush = (items) => {
          if (!items.length) return;
          accumulated = [...accumulated, ...items];
          setDashboards([...accumulated]);
          setFetchedCount(accumulated.length);
          if (!shownTable) { shownTable = true; setLoading(false); }
        };

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (controller.signal.aborted) return;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const t = line.trim();
              if (!t) continue;
              try {
                const parsed = JSON.parse(t);
                flush(Array.isArray(parsed) ? parsed : [parsed]);
              } catch { }
            }
          }
          const tail = (buffer + decoder.decode()).trim();
          if (tail) {
            try {
              const parsed = JSON.parse(tail);
              flush(Array.isArray(parsed) ? parsed : [parsed]);
            } catch { }
          }
        } else {
          const data = await resp.json();
          flush(Array.isArray(data) ? data : (data.data || []));
        }

        if (!shownTable) setLoading(false);
        dashboardCache.set(cacheKey, accumulated);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("Could not load dashboards. Check your credentials and try again.");
        setLoading(false);
      } finally {
        if (!controller.signal.aborted) setPartialLoading(false);
      }
    })();

    return () => { abortRef.current?.abort(); };
  }, [cacheKey]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return dashboards.filter(d => d.id?.toString().toLowerCase().includes(q) || d.title?.toLowerCase().includes(q));
  }, [dashboards, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <TransferLoader fetched={fetchedCount} label="Fetching Dashboards…" />;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 3vw, 1.4rem)" }}>
      <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", height: "100%", gap: "0.8rem" }}>

        <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "0.2rem 0.65rem", marginBottom: "0.45rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", animation: "dotPulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--violet)" }}>Step 2 of 3</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ color: "var(--violet)", display: "flex" }}><GridIcon /></div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
                Select a Dashboard
              </h2>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: searchFocused ? "var(--violet)" : "var(--text-muted)", pointerEvents: "none", transition: "color 0.2s" }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search dashboards…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                background: "rgba(255,255,255,0.85)",
                border: `1.5px solid ${searchFocused ? "var(--violet)" : "var(--border)"}`,
                borderRadius: 12,
                color: "var(--text-primary)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.82rem",
                padding: "0.52rem 0.9rem 0.52rem 2.1rem",
                width: "clamp(180px, 28vw, 260px)",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: searchFocused ? "var(--shadow-glow)" : "none",
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ flexShrink: 0, background: "rgba(244,63,94,0.06)", border: "1.5px solid rgba(244,63,94,0.18)", borderRadius: 12, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#e11d48" }}>
            <AlertIcon /> {error}
          </div>
        )}

        <div style={{
          flex: 1, minHeight: 0,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 40px rgba(99,102,241,0.08), 0 2px 8px rgba(15,23,42,0.05)",
        }}>
          <div style={{ flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
            <table style={{ width: "100%", minWidth: 340, tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "63%" }} />
                <col style={{ width: "21%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(129,140,248,0.03) 100%)" }}>
                  {["Dashboard ID", "Title", "Action"].map((h, i) => (
                    <th key={h} style={{
                      padding: "0.65rem clamp(0.65rem, 2vw, 1rem)",
                      textAlign: i === 2 ? "right" : "left",
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700, fontSize: "0.62rem",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", minWidth: 340, tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "63%" }} />
                <col style={{ width: "21%" }} />
              </colgroup>
              <tbody>
                {filteredData.length === 0 && !partialLoading ? (
                  <tr>
                    <td colSpan="3" style={{ padding: "4rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.65rem" }}>
                        <div style={{ color: "var(--text-muted)" }}><EmptyIcon /></div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          {dashboards.length === 0 ? "No dashboards found" : "No results match your search"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentData.map((d, idx) => (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.018, duration: 0.25 }}
                        style={{ borderBottom: "1px solid var(--border)", cursor: "default", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "0.65rem clamp(0.65rem, 2vw, 1rem)", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.id}
                        </td>
                        <td style={{ padding: "0.65rem clamp(0.65rem, 2vw, 1rem)", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.title}>
                          {d.title}
                        </td>
                        <td style={{ padding: "0.65rem clamp(0.65rem, 2vw, 1rem)", textAlign: "right" }}>
                          <button
                            onClick={() => { setSelectedDash(d); navigate("/migrate"); }}
                            style={{
                              background: "var(--emerald-dim)", border: "1.5px solid rgba(16,185,129,0.25)",
                              color: "var(--emerald)", fontFamily: "'Bricolage Grotesque', sans-serif",
                              fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em",
                              textTransform: "uppercase", padding: "0.32rem 0.65rem",
                              borderRadius: 8, cursor: "pointer", transition: "all 0.18s",
                              whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.18)"; e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.2)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "var(--emerald-dim)"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                          >
                            Migrate <ArrowRightSmall />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {partialLoading && (
                      [...Array(3)].map((_, i) => (
                        <tr key={`sk-${i}`} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 13, width: "65%" }} /></td>
                          <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 13, width: "72%", animationDelay: "0.08s" }} /></td>
                          <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 28, width: "75%", marginLeft: "auto", animationDelay: "0.16s" }} /></td>
                        </tr>
                      ))
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {dashboards.length > 0 && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)" }}>
              {search && filteredData.length !== dashboards.length && <>
                <b style={{ color: "var(--text-secondary)" }}>{filteredData.length}</b> results
              </>}
            </p>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border)", color: "var(--text-secondary)", borderRadius: 9, padding: "0.32rem 0.7rem", fontSize: "0.75rem", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.35 : 1, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "var(--violet)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <ChevronLeftIcon /> Prev
                </button>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", padding: "0 0.35rem", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid var(--border)", color: "var(--text-secondary)", borderRadius: 9, padding: "0.32rem 0.7rem", fontSize: "0.75rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.35 : 1, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Outfit', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "var(--violet)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  Next <ChevronRightIcon />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}