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
const CheckCircleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 8.5l2.5 2.5 4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

/* ── Section Card ── */
const SectionCard = ({ number, title, icon, children }) => (
  <div style={{
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1.5px solid rgba(255,255,255,0.95)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(99,102,241,0.06), 0 2px 6px rgba(15,23,42,0.04)",
  }}>
    {/* Section header */}
    <div style={{ padding: "0.85rem 1.15rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(129,140,248,0.02) 100%)" }}>
      <div style={{ width: 28, height: 28, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 1 }}>{number}</div>
      </div>
    </div>
    <div style={{ padding: "1rem 1.15rem" }}>
      {children}
    </div>
  </div>
);

export default function Step3Migrate({ lookerCreds, selectedDash }) {
  const navigate = useNavigate();
  const [domoForm, setDomoForm] = useState({ pageId: "", csrf: "", cookie: "" });
  const [resolvedMappings, setResolvedMappings] = useState({});
  const [lookerViews, setLookerViews] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!lookerCreds || !selectedDash) { navigate("/"); return; }
    const cacheKey = `${lookerCreds.url}__${selectedDash.id}`;
    if (previewCache.has(cacheKey)) {
      const c = previewCache.get(cacheKey);
      setDashboardTitle(c.dashboard_name || selectedDash.title);
      setLookerViews(c.looker_datasets || []);
      setVisuals(c.visuals || []);
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
    })
    .catch(err => console.error("Preview error:", err))
    .finally(() => setLoading(false));
  }, [lookerCreds?.url, lookerCreds?.id, selectedDash?.id]);

  const executeMigration = async () => {
    if (!domoForm.pageId || !domoForm.csrf || !domoForm.cookie) {
      alert("Please fill in all Domo session fields.");
      return;
    }
    const missing = lookerViews.filter(v => !resolvedMappings[v.name]?.trim());
    if (missing.length > 0) {
      alert("Missing dataset UUIDs for: " + missing.map(v => v.name).join(", "));
      return;
    }
    setStatus("loading");
    try {
      await migrateDashboard({
        looker_url: lookerCreds.url, looker_client_id: lookerCreds.id,
        looker_client_secret: lookerCreds.secret, looker_id: selectedDash.id,
        domo_page_id: domoForm.pageId, domo_cookie: domoForm.cookie,
        domo_csrf: domoForm.csrf, dataset_mapping: resolvedMappings,
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
        <button onClick={() => navigate("/dashboards")} className="btn-primary" style={{ width: "auto", padding: "0.6rem 1.4rem" }}>
          Back to Dashboards
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.2rem" }}>
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div style={{ position: "absolute", inset: 0, border: "2px solid var(--border)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTopColor: "var(--violet)", borderRightColor: "var(--violet-light)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ position: "absolute", inset: 8, background: "var(--violet-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--violet)" }}>
            <DashboardIcon />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>Scanning Assets</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>Analysing dashboard components…</p>
        </div>
      </div>
    );
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status.startsWith("error:");
  const errorMsg  = isError ? status.replace("error:", "") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)" }}
    >
      {/* Back */}
      <div style={{ flexShrink: 0, marginBottom: "0.7rem" }}>
        <button
          onClick={() => navigate("/dashboards")}
          style={{ background: "none", border: "none", padding: "0.2rem 0", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "'Outfit', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "color 0.18s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--violet)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <BackIcon /> Back to Dashboards
        </button>
      </div>

      {/* Scroll area */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.9rem", paddingBottom: "2rem" }}>

          {/* Page title */}
          <div>
            {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "0.2rem 0.65rem", marginBottom: "0.45rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", animation: "dotPulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--violet)" }}>Step 3 of 3</span>
            </div> */}
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.35rem)", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
              Configure & Migrate
            </h2>
          </div>

          {/* Dashboard title chip */}
          <div style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(255,255,255,0.95)", borderRadius: 14, padding: "0.8rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 2px 12px rgba(99,102,241,0.06)" }}>
            <div style={{ width: 36, height: 36, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--violet)" }}>
              <DashboardIcon />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="field-label" style={{ marginBottom: 2 }}>Selected Dashboard</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {dashboardTitle}
              </div>
            </div>
          </div>

          {/* Section 1: Dataset Mapping */}
          <SectionCard number="" title="Dataset Mapping" icon={<MapIcon />}>
            <p style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              Map each Looker view to its corresponding Domo Dataset UUID.
            </p>
            {lookerViews.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No Looker views detected.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {lookerViews.map((view, i) => (
                  <div key={i} style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.75rem" }}>
                    <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: "0.45rem" }}>
                      <span style={{ color: "var(--violet)" }}><MapIcon /></span>
                      {view.name}
                    </label>
                    <input
                      className="fancy-input"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={resolvedMappings[view.name] || ""}
                      onChange={(e) => setResolvedMappings(p => ({ ...p, [view.name]: e.target.value }))}
                      style={{ fontFamily: "monospace", fontSize: "0.8rem", background: "white" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Section 2: Charts (conditional) */}
          {visuals.length > 0 && (
            <SectionCard number="" title={`Charts to Migrate (${visuals.length})`} icon={<BarChartIcon />}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", maxHeight: 230, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(129,140,248,0.03))", borderBottom: "1px solid var(--border)" }}>
                      {["Title", "Type", "Looker View"].map((h, i) => (
                        <th key={h} style={{ padding: "0.5rem 0.8rem", textAlign: "left", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visuals.map((viz, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "0.5rem 0.8rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{viz.title || "—"}</td>
                        <td style={{ padding: "0.5rem 0.8rem", whiteSpace: "nowrap" }}>
                          <span style={{ background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", color: "var(--violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.15rem 0.45rem", borderRadius: 6 }}>
                            {viz.type || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem 0.8rem", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.73rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                          {lookerViews.find(v => v.id === viz.datasetRef)?.name || viz.datasetRef || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Section 3: Domo Session */}
          <SectionCard number={visuals.length > 0 ? "" : "Section 02"} title="Domo Session Details" icon={<TokenIcon />}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--violet)" }}><IdIcon /></span>
                  Target Page ID
                </label>
                <input className="fancy-input" placeholder="e.g. 650770219"
                  value={domoForm.pageId} onChange={e => setDomoForm(p => ({ ...p, pageId: e.target.value }))} />
              </div>
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--violet)" }}><TokenIcon /></span>
                  CSRF Token
                </label>
                <input className="fancy-input" placeholder="Paste x-csrf-token value"
                  value={domoForm.csrf} onChange={e => setDomoForm(p => ({ ...p, csrf: e.target.value }))} />
              </div>
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--violet)" }}><CookieIcon /></span>
                  Session Cookies
                </label>
                <textarea
                  rows={3}
                  className="fancy-input"
                  placeholder="Paste full cookie string from browser DevTools"
                  value={domoForm.cookie}
                  onChange={e => setDomoForm(p => ({ ...p, cookie: e.target.value }))}
                  style={{ resize: "none", lineHeight: 1.5 }}
                />
              </div>
            </div>
          </SectionCard>

          {/* Execute */}
          <div>
            <button
              onClick={executeMigration}
              disabled={isLoading || isSuccess}
              className="btn-emerald"
              style={{ padding: "0.9rem 1.2rem", fontSize: "0.9rem" }}
            >
              {isLoading ? (
                <>
                  <div style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Migrating…
                </>
              ) : isSuccess ? (
                <><CheckCircleIcon /> Migration Complete</>
              ) : (
                <><ZapIcon /> Execute Full Migration</>
              )}
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: "0.7rem", background: "rgba(16,185,129,0.07)", border: "1.5px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: 9, fontSize: "0.85rem", fontWeight: 600, color: "#059669", fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  <CheckCircleIcon /> Dashboard migrated to Domo successfully!
                </motion.div>
              )}
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: "0.7rem", background: "var(--rose-dim)", border: "1.5px solid rgba(244,63,94,0.2)", borderRadius: 14, padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#e11d48" }}
                >
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
    </motion.div>
  );
}