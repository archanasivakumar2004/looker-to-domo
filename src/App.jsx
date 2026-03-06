import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Header from "./components/Header";
import Step1LookerAuth from "./pages/Step1LookerAuth";
import Step2DashboardList from "./pages/Step2DashboardList";
import Step3Migrate from "./pages/Step3Migrate";

// Subtle floating orb background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Orb 1 - indigo top-left */}
      <div
        style={{
          position: "absolute",
          width: "45vw",
          height: "45vw",
          maxWidth: 520,
          maxHeight: 520,
          top: "-10%",
          left: "-8%",
          background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "floatA 14s ease-in-out infinite",
        }}
      />
      {/* Orb 2 - purple bottom-right */}
      <div
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          maxWidth: 580,
          maxHeight: 580,
          bottom: "-12%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(168,85,247,0.11) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "floatB 18s ease-in-out infinite",
        }}
      />
      {/* Orb 3 - teal center */}
      <div
        style={{
          position: "absolute",
          width: "30vw",
          height: "30vw",
          maxWidth: 380,
          maxHeight: 380,
          top: "40%",
          left: "38%",
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "floatC 22s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(4%, 6%) scale(1.05); }
          66% { transform: translate(-3%, 3%) scale(0.97); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-5%, -4%) scale(1.06); }
          70% { transform: translate(3%, -2%) scale(0.96); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-6%, 5%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [lookerCreds, setLookerCreds] = useState(null);
  const [selectedDash, setSelectedDash] = useState(null);

  return (
    <div
      style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}
      className="bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50"
    >
      <AnimatedBackground />

      {/* All content sits above the background */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Header />

        <Routes>
          <Route
            path="/"
            element={<Step1LookerAuth setLookerCreds={setLookerCreds} />}
          />
          <Route
            path="/dashboards"
            element={
              <Step2DashboardList
                lookerCreds={lookerCreds}
                setSelectedDash={setSelectedDash}
              />
            }
          />
          <Route
            path="/migrate"
            element={
              <Step3Migrate
                lookerCreds={lookerCreds}
                selectedDash={selectedDash}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}