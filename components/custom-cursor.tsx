"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button") || target.closest("[data-cursor-hover]")) {
        setHovering(true);
      }
    };

    const onOut = () => setHovering(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [visible]);

  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-150 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) scale(${hovering ? 2 : 1})`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="rounded-full transition-all duration-300"
        style={{
          width: hovering ? 8 : 16,
          height: hovering ? 8 : 16,
          background: hovering ? "transparent" : "hsl(224 55% 23%)",
          border: hovering ? "2px solid hsl(224 55% 35%)" : "none",
          boxShadow: "0 0 20px hsl(224 55% 23% / 0.4), 0 0 40px hsl(224 55% 23% / 0.1)",
          transition: "width 0.3s, height 0.3s, background 0.3s, border 0.3s",
        }}
      />
    </div>
  );
}
