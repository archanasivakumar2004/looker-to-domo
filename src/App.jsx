import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import Header from "./components/Header";
import Step1LookerAuth from "./pages/Step1LookerAuth";
import Step2DashboardList from "./pages/Step2DashboardList";
import Step3Migrate from "./pages/Step3Migrate";

/* ─── Animated Mesh + Particle Background ─── */
function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // Floating orbs
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 180 + Math.random() * 260,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hue: [260, 220, 280, 200, 240, 270][i],
      alpha: 0.06 + Math.random() * 0.06,
    }));

    // Floating particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.5 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.15 - Math.random() * 0.35,
      alpha: 0.15 + Math.random() * 0.25,
      hue: 240 + Math.random() * 40,
    }));

    // Grid dot nodes
    const gapX = 80, gapY = 80;
    const cols = Math.ceil(W / gapX) + 1;
    const rows = Math.ceil(H / gapY) + 1;

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw soft grid lines
      ctx.strokeStyle = "rgba(99,102,241,0.04)";
      ctx.lineWidth = 1;
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * gapX, 0);
        ctx.lineTo(c * gapX, H);
        ctx.stroke();
      }
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * gapY);
        ctx.lineTo(W, r * gapY);
        ctx.stroke();
      }

      // Grid dots
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          ctx.arc(c * gapX, r * gapY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(99,102,241,0.12)";
          ctx.fill();
        }
      }

      // Orbs
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,65%,${o.alpha})`);
        g.addColorStop(1, `hsla(${o.hue},80%,65%,0)`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
      });

      // Particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,60%,${p.alpha})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 1 }}
    />
  );
}

export default function App() {
  const [lookerCreds, setLookerCreds] = useState(null);
  const [selectedDash, setSelectedDash] = useState(null);

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
      <AnimatedBackground />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Header />
        <Routes>
          <Route path="/" element={<Step1LookerAuth setLookerCreds={setLookerCreds} />} />
          <Route path="/dashboards" element={<Step2DashboardList lookerCreds={lookerCreds} setSelectedDash={setSelectedDash} />} />
          <Route path="/migrate" element={<Step3Migrate lookerCreds={lookerCreds} selectedDash={selectedDash} />} />
        </Routes>
      </div>
    </div>
  );
}