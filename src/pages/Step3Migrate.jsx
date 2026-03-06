import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { migrateDashboard } from "../services/api";

const API_BASE = "http://localhost:8000";
const previewCache = new Map();

export default function Step3Migrate({ lookerCreds, selectedDash }) {
  const navigate = useNavigate();

  const [domoForm, setDomoForm]                 = useState({ pageId: "", csrf: "", cookie: "" });
  const [resolvedMappings, setResolvedMappings] = useState({});
  const [lookerViews, setLookerViews]           = useState([]);
  const [visuals, setVisuals]                   = useState([]);
  const [dashboardTitle, setDashboardTitle]     = useState("");
  const [loading, setLoading]                   = useState(true);
  const [status, setStatus]                     = useState("");

  /* ── FETCH PREVIEW ── */
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
    axios
      .post(`${API_BASE}/looker/preview`, {
        looker_url:           lookerCreds.url,
        looker_id:            selectedDash.id,
        looker_client_id:     lookerCreds.id,
        looker_client_secret: lookerCreds.secret,
      })
      .then((res) => {
        previewCache.set(cacheKey, res.data);
        setDashboardTitle(res.data.dashboard_name || selectedDash.title);
        setLookerViews(res.data.looker_datasets || []);
        setVisuals(res.data.visuals || []);
      })
      .catch((err) => console.error("Preview error:", err))
      .finally(() => setLoading(false));
  }, [lookerCreds?.url, lookerCreds?.id, selectedDash?.id]);

  const updateMapping = (viewName, domoId) =>
    setResolvedMappings((prev) => ({ ...prev, [viewName]: domoId }));

  /* ── MIGRATE ── */
  const executeMigration = async () => {
    if (!domoForm.pageId || !domoForm.csrf || !domoForm.cookie) {
      alert("Please fill in Page ID, CSRF Token, and Cookies.");
      return;
    }
    const missing = lookerViews.filter((v) => !resolvedMappings[v.name]?.trim());
    if (missing.length > 0) {
      alert("Please provide a Domo Dataset UUID for: " + missing.map((v) => v.name).join(", "));
      return;
    }
    setStatus("loading");
    try {
      await migrateDashboard({
        looker_url:           lookerCreds.url,
        looker_client_id:     lookerCreds.id,
        looker_client_secret: lookerCreds.secret,
        looker_id:            selectedDash.id,
        domo_page_id:         domoForm.pageId,
        domo_cookie:          domoForm.cookie,
        domo_csrf:            domoForm.csrf,
        dataset_mapping:      resolvedMappings,
      });
      setStatus("success");
    } catch (err) {
      const detail = err.response?.data?.detail
        ? JSON.stringify(err.response.data.detail)
        : err.message;
      setStatus("error:" + detail);
    }
  };

  /* ── GUARD ── */
  if (!selectedDash) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-slate-500 text-sm">No dashboard selected.</p>
        <button onClick={() => navigate("/dashboards")}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer">
          ← Back to Dashboards
        </button>
      </div>
    );
  }

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm text-indigo-600 font-medium">Scanning Looker Dashboard Assets...</p>
      </div>
    );
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status.startsWith("error:");
  const errorMsg  = isError ? status.replace("error:", "") : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full px-3 sm:px-6 py-3"
    >


        
      {/* Inject CSS to hide scrollbar on .hide-scrollbar */}
      <style>{`
        .hide-scrollbar {
          overflow-y: auto;
          scrollbar-width: none;       /* Firefox */
          -ms-overflow-style: none;    /* IE/Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;               /* Chrome/Safari/Opera */
        }
      `}</style>

      {/* Back */}
      <div className="flex-shrink-0 mb-2">
        <button onClick={() => navigate("/dashboards")}
          className="text-xs text-indigo-600 hover:underline cursor-pointer">
          ← Back to Dashboards
        </button>
      </div>

      {/*
        Outer body: scrolls to reach all content but scrollbar is invisible.
        Charts table inside has its own visible scrollbar.
      */}
<div className="hide-scrollbar flex-1 max-w-2xl mx-auto w-full pb-24">        <div className="flex flex-col gap-3 pb-4">

          {/* ── Dashboard Title ── */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-indigo-100 px-4 py-3">
            <p className="text-xs text-black uppercase tracking-widest font-semibold mb-0.5">
              Dashboard Title
            </p>
            <p className="text-sm font-bold text-indigo-700 truncate">{dashboardTitle}</p>
          </div>

          {/* ── Section 1: Required Domo Datasets ── */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-indigo-100 px-4 py-3">
            <p className="text-xs text-black uppercase tracking-widest font-semibold mb-1">
              1. Required Domo Datasets
            </p>
            <p className="text-xs text-slate-500 mb-2">
              Provide the Domo Dataset UUID for each Looker View used in this dashboard.
            </p>
            {lookerViews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No views found from API.</p>
            ) : (
              <div className="space-y-2">
                {lookerViews.map((view, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-indigo-700">{view.name}</span>
                    <input
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                      placeholder="Enter Domo Dataset UUID..."
                      value={resolvedMappings[view.name] || ""}
                      onChange={(e) => updateMapping(view.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 2: Charts to be Migrated — scrollbar visible here only ── */}
          {visuals.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-indigo-100 px-4 py-3">
              <p className="text-xs text-black uppercase tracking-widest font-semibold mb-2">
                2. Charts to be Migrated
              </p>
              {/* This table has its OWN visible scrollbar */}
<div className="max-h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200">                <table className="w-full min-w-[320px] table-auto text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Title</th>
                      <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Type</th>
                      <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Source Looker View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visuals.map((viz, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">{viz.title || "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                            {viz.type || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500 font-mono whitespace-nowrap">
                          {lookerViews.find((v) => v.id === viz.datasetRef)?.name || viz.datasetRef || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Section 3: Domo Session Details ── */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow border border-indigo-100 px-4 py-3">
            <p className="text-xs text-black uppercase tracking-widest font-semibold mb-3">
              {visuals.length > 0 ? "3." : "2."} Domo Session Details
            </p>

            <div className="mb-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Page ID</label>
              <input
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                placeholder="e.g. 650770219"
                value={domoForm.pageId}
                onChange={(e) => setDomoForm({ ...domoForm, pageId: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">CSRF Token</label>
              <input
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
                placeholder="Paste x-csrf-token"
                value={domoForm.csrf}
                onChange={(e) => setDomoForm({ ...domoForm, csrf: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Session Cookies</label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition bg-white"
                placeholder="Paste full cookie string from browser"
                value={domoForm.cookie}
                onChange={(e) => setDomoForm({ ...domoForm, cookie: e.target.value })}
              />
            </div>
          </div>

          {/* ── Execute Migration Button ── */}
          <div>
            <button
              onClick={executeMigration}
              disabled={isLoading || isSuccess}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Migrating...
                </span>
              ) : " Execute Full Migration"}
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-semibold"
                >
                  ✅ Migration Successful!
                </motion.div>
              )}
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-semibold"
                >
                  ❌ Error: {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
}