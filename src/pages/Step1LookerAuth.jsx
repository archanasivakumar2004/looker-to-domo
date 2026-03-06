import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Step1LookerAuth({ setLookerCreds }) {
  const [form, setForm] = useState({ url: "", id: "", secret: "" });
  const navigate = useNavigate();

  const next = () => {
    if (!form.url || !form.id || !form.secret) return;
    // Set creds immediately and navigate — Step2 will start fetching in parallel
    setLookerCreds(form);
    navigate("/dashboards");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") next();
  };

  const isValid = form.url.trim() && form.id.trim() && form.secret.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl px-5 py-6 rounded-2xl shadow-2xl border border-indigo-100">

        <div className="mb-5 text-center">
          <h2 className="text-lg font-bold text-indigo-700">Looker Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">
            Enter your Looker credentials to fetch dashboards
          </p>
        </div>

        <input
          className="w-full mb-3 px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
          placeholder="Looker URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          onKeyDown={handleKey}
          autoComplete="off"
        />

        <input
          className="w-full mb-3 px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
          placeholder="Client ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          onKeyDown={handleKey}
          autoComplete="off"
        />

        <input
          type="password"
          className="w-full mb-5 px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
          placeholder="Client Secret"
          value={form.secret}
          onChange={(e) => setForm({ ...form, secret: e.target.value })}
          onKeyDown={handleKey}
          autoComplete="new-password"
        />

        <button
          onClick={next}
          disabled={!isValid}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Fetch Dashboards →
        </button>

      </div>
    </motion.div>
  );
}