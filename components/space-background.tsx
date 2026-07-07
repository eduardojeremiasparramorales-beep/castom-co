"use client";

import { useEffect, useRef, useMemo } from "react";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    let frame: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const s of stars) {
        const alpha = s.a * (0.5 + 0.5 * Math.sin(time * s.speed * 10 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
        ctx.fill();
      }

      // Random shooting star
      if (Math.random() < 0.002) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 6;
        shootingStars.push({
          x: Math.random() * w,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 2,
          life: 0,
          maxLife: 30 + Math.random() * 30,
        });
      }

      // Update & draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        if (ss.life > ss.maxLife || ss.x < -50 || ss.x > w + 50 || ss.y > h + 50) {
          shootingStars.splice(i, 1);
          continue;
        }
        const progress = ss.life / ss.maxLife;
        const alpha = 1 - progress;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 3, ss.y - ss.vy * 3);
        ctx.strokeStyle = `rgba(180, 190, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

function NebulaBlob({ index }: { index: number }) {
  const positions = [
    { top: "15%", left: "10%", size: 500, colors: ["hsla(224, 55%, 23%, 0.12)", "hsla(260, 50%, 30%, 0.08)", "transparent"] },
    { top: "60%", right: "5%", size: 400, colors: ["hsla(190, 60%, 35%, 0.10)", "hsla(224, 55%, 23%, 0.06)", "transparent"] },
    { top: "80%", left: "30%", size: 350, colors: ["hsla(280, 45%, 25%, 0.10)", "hsla(224, 55%, 23%, 0.06)", "transparent"] },
    { top: "30%", right: "25%", size: 300, colors: ["hsla(224, 55%, 30%, 0.08)", "hsla(200, 50%, 30%, 0.06)", "transparent"] },
  ];

  const p = positions[index % positions.length];

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{
        top: p.top,
        left: "left" in p ? p.left : undefined,
        right: "right" in p ? p.right : undefined,
        width: p.size,
        height: p.size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${p.colors[0]} 0%, ${p.colors[1]} 40%, ${p.colors[2]} 70%)`,
        filter: "blur(60px)",
        animation: `nebula-float-${index} 20s ease-in-out infinite`,
        transformOrigin: "center",
      }}
    />
  );
}

export function SpaceBackground() {
  return (
    <>
      <NebulaBlob index={0} />
      <NebulaBlob index={1} />
      <NebulaBlob index={2} />
      <NebulaBlob index={3} />
      <StarField />
    </>
  );
}
