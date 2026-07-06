"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones, TrendingDown, Package, Truck, Shield } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const rotatingProducts = [
  { src: "/images/airpods-lineup.png", alt: "AirPods" },
  { src: "/images/hoodie-castom.png", alt: "Hoodie" },
  { src: "/images/camisa-castom.png", alt: "Camisa" },
];

const stats = [
  { icon: Package, label: "Productos", value: "50+" },
  { icon: Truck, label: "Envíos", value: "Colombia" },
  { icon: Shield, label: "Calidad", value: "Garantizada" },
  { icon: TrendingDown, label: "Mayorista", value: "6 uds." },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [currentProduct, setCurrentProduct] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((p) => (p + 1) % rotatingProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
      mouseX.set((x - 0.5) * 30);
      mouseY.set((y - 0.5) * 30);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  const parallaxStyle = (depth: number) => ({
    x: (mousePos.x - 0.5) * depth,
    y: (mousePos.y - 0.5) * depth,
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[90vh] flex items-center"
      style={{ background: "#1B2B5E" }}
    >
      {/* Animated gradient layers */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(224 55% 40%), transparent 70%)",
            ...parallaxStyle(40),
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-3/4 h-3/4 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(260 60% 50%), transparent 70%)",
            ...parallaxStyle(-30),
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/3 w-1/3 h-1/3 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, hsl(200 60% 60%), transparent 70%)",
            ...parallaxStyle(20),
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div style={{ scale, opacity }} className="w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 py-20 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
              style={{ perspective: "1000px" }}
            >
              <motion.p
                className="text-white/50 text-xs font-mono uppercase tracking-[0.3em] mb-4"
                style={{ transformStyle: "preserve-3d" }}
              >
                Built Different. Made For You.
              </motion.p>
              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-display text-white tracking-tight leading-[0.85]"
                style={{ transformStyle: "preserve-3d" }}
              >
                CASTOM
                <motion.span
                  className="block text-xl md:text-2xl lg:text-3xl font-semibold text-white/60 mt-2"
                  style={{ transform: "translateZ(20px)" }}
                >
                  .CO
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-white/60 mt-6 text-lg max-w-md leading-relaxed"
                style={{ transform: "translateZ(10px)" }}
              >
                Tecnología, ropa y accesorios con estilo. Precios especiales al por mayor a partir de 6 unidades.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 mt-8"
                style={{ transform: "translateZ(15px)" }}
              >
                <Link
                  href="/tienda"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white font-bold text-sm uppercase tracking-wider rounded-md hover:bg-gray-100 transition-all duration-300"
                  style={{ color: "#1B2B5E" }}
                >
                  Ver Tienda
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/mayoristas"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:bg-white/10 transition-all duration-300"
                >
                  <Headphones size={16} />
                  Mayoristas
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-6 mt-10 pt-8 border-t border-white/10"
              >
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <s.icon size={18} className="mx-auto mb-1 text-white/40" />
                    <p className="text-white font-bold text-sm">{s.value}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - 3D Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0, 0, 1] }}
              className="relative"
              style={{ perspective: "1200px" }}
            >
              <motion.div
                className="relative aspect-square max-w-[500px] mx-auto"
                style={{
                  transformStyle: "preserve-3d",
                  rotateX: useSpring(useTransform(mouseX, [-30, 30], [5, -5])),
                  rotateY: useSpring(useTransform(mouseY, [-30, 30], [-5, 5])),
                }}
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, hsl(224 55% 30% / 0.4), transparent 70%)",
                    transform: "translateZ(-50px)",
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Rotating product images */}
                {rotatingProducts.map((product, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: i === currentProduct ? 1 : 0,
                      scale: i === currentProduct ? 1 : 0.8,
                      rotateY: i === currentProduct ? 0 : i < currentProduct ? -45 : 45,
                      rotateX: i === currentProduct ? 0 : 10,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.2, 0, 0, 1],
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateZ(${i === currentProduct ? 0 : -100}px)`,
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={product.src}
                        alt={product.alt}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </motion.div>
                ))}

                {/* 3D floating elements around the product */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center"
                  style={{ transform: "translateZ(40px)" }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingDown size={20} className="text-white/60" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-4 w-14 h-14 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center"
                  style={{ transform: "translateZ(30px)" }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Package size={18} className="text-white/60" />
                </motion.div>

                {/* Product navigation dots */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {rotatingProducts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentProduct(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentProduct ? "bg-white w-6" : "bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
