import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboards } from "../services/api";
import { motion } from "framer-motion";

//store dashboard data memory
const dashboardCache = new Map();

export default function Step2DashboardList({ lookerCreds, setSelectedDash }) {
  const [dashboards, setDashboards] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const itemsPerPage = 20;

  const cacheKey = lookerCreds ? `${lookerCreds.url}__${lookerCreds.id}` : null;

  useEffect(() => {
    if (!lookerCreds) { navigate("/"); return; }
    if (cacheKey && dashboardCache.has(cacheKey)) {
      setDashboards(dashboardCache.get(cacheKey));
      return;
    }
    setLoading(true);
    setError("");
    fetchDashboards(lookerCreds)
      .then((res) => {
        const data = res.data || [];
        dashboardCache.set(cacheKey, data);
        setDashboards(data);
      })
      .catch(() => setError("Failed to load dashboards. Check your credentials."))
      .finally(() => setLoading(false));
  }, [cacheKey]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return dashboards.filter(
      (d) =>
        d.id?.toString().toLowerCase().includes(q) ||
        d.title?.toLowerCase().includes(q),
    );
  }, [dashboards, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const handleSelectDash = (d) => {
    setSelectedDash(d);
    navigate("/migrate");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-3 sm:px-6 py-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col h-full">

        {/* Title */}
        <div className="text-center mb-3 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
            Available Dashboards
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Search and select a dashboard to migrate
          </p>
        </div>

        {/* Search */}
        <div className="mb-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by ID or Title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-72 md:w-80 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center flex-shrink-0">
            {error}
          </div>
        )}

        {/* Table — fills remaining space, scrolls internally */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Sticky header */}
          <div className="flex-shrink-0">
            <table className="w-full min-w-[400px]" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "60%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3 text-left">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full min-w-[400px]" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "60%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(12)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 sm:px-6 py-2.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                      <td className="px-4 sm:px-6 py-2.5"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                      <td className="px-4 sm:px-6 py-2.5"><div className="h-7 bg-slate-200 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-16 text-center text-slate-400 text-sm">
                      {dashboards.length === 0 ? "No dashboards found." : "No results match your search."}
                    </td>
                  </tr>
                ) : (
                  currentData.map((d, index) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className="hover:bg-indigo-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-mono font-medium text-slate-700 truncate">
                        {d.id}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-xs sm:text-sm text-slate-600 truncate" title={d.title}>
                        {d.title}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-right">
                        <button
                          onClick={() => handleSelectDash(d)}
                          className="px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-all shadow-md whitespace-nowrap cursor-pointer"
                        >
                          Migrate
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer: showing count + pagination — always visible at bottom */}
        {!loading && dashboards.length > 0 && (
          <div className="mt-2 flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs sm:text-sm text-slate-500">
              {filteredData.length === 0 ? (
                "No results"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startIndex + 1}–{Math.min(endIndex, filteredData.length)}
                  </span>
                  {" "}of{" "}
                  <span className="font-semibold text-slate-700">{filteredData.length}</span>
                  {search && dashboards.length !== filteredData.length && (
                    <span className="text-slate-400"> (filtered from {dashboards.length})</span>
                  )}
                </>
              )}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
                >
                  ← Prev
                </button>
                <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}