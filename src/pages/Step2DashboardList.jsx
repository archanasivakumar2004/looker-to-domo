import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboards } from "../services/api";
import { motion } from "framer-motion";

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

export default function Step2DashboardList({ lookerCreds, setSelectedDash }) {
  const [dashboards, setDashboards] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 20;

  const cacheKey = lookerCreds ? `${lookerCreds.url}__${lookerCreds.id}` : null;

  useEffect(() => {
    if (!lookerCreds) { navigate("/"); return; }
    if (cacheKey && dashboardCache.has(cacheKey)) { setDashboards(dashboardCache.get(cacheKey)); return; }
    setLoading(true); setError("");
    fetchDashboards(lookerCreds)
      .then((res) => { const d = res.data || []; dashboardCache.set(cacheKey, d); setDashboards(d); })
      .catch(() => setError("Could not load dashboards. Check your credentials and try again."))
      .finally(() => setLoading(false));
  }, [cacheKey]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return dashboards.filter(d => d.id?.toString().toLowerCase().includes(q) || d.title?.toLowerCase().includes(q));
  }, [dashboards, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 3vw, 1.4rem)" }}>
      <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", height: "100%", gap: "0.8rem" }}>

        {/* Top bar */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            {/* <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "0.2rem 0.65rem", marginBottom: "0.45rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", animation: "dotPulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--violet)" }}>Step 2 of 3</span>
            </div> */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ color: "var(--violet)", display: "flex" }}><GridIcon /></div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
                Select a Dashboard
              </h2>
              {!loading && dashboards.length > 0 && (
                <span style={{ background: "var(--violet-dim)", border: "1px solid rgba(99,102,241,0.18)", color: "var(--violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.65rem", padding: "0.18rem 0.55rem", borderRadius: 99 }}>
                  {dashboards.length}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
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

        {/* Error */}
        {error && (
          <div style={{ flexShrink: 0, background: "rgba(244,63,94,0.06)", border: "1.5px solid rgba(244,63,94,0.18)", borderRadius: 12, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#e11d48" }}>
            <AlertIcon /> {error}
          </div>
        )}

        {/* Table */}
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
          {/* thead */}
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
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* tbody */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", minWidth: 340, tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "63%" }} />
                <col style={{ width: "21%" }} />
              </colgroup>
              <tbody>
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 13, width: "65%" }} /></td>
                      <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 13, width: "72%", animationDelay: "0.08s" }} /></td>
                      <td style={{ padding: "0.75rem clamp(0.65rem, 2vw, 1rem)" }}><div className="skeleton" style={{ height: 28, width: "75%", marginLeft: "auto", animationDelay: "0.16s" }} /></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
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
                  currentData.map((d, idx) => (
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
                            background: "var(--emerald-dim)",
                            border: "1.5px solid rgba(16,185,129,0.25)",
                            color: "var(--emerald)",
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            padding: "0.32rem 0.65rem",
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "all 0.18s",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.18)"; e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "var(--emerald-dim)"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          Migrate <ArrowRightSmall />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {!loading && dashboards.length > 0 && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)" }}>
              {filteredData.length === 0 ? "No results" : <>
                Showing <b style={{ color: "var(--text-secondary)" }}>{startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredData.length)}</b> of <b style={{ color: "var(--text-secondary)" }}>{filteredData.length}</b>
                {search && dashboards.length !== filteredData.length && <span style={{ color: "var(--text-muted)" }}> (filtered from {dashboards.length})</span>}
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