"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Tag, ShoppingCart, Handshake, ArrowUpRight, TrendingDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export function WholesaleSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);

  const features = [
    { icon: Package, title: "Productos de Calidad", desc: "Garantía en todos nuestros productos" },
    { icon: Tag, title: "Precios Especiales", desc: "Descuentos exclusivos al por mayor" },
    { icon: ShoppingCart, title: "Stock Disponible", desc: "Siempre listos para despacho" },
    { icon: Handshake, title: "Alianzas que Suman", desc: "Crecemos juntos con tu negocio" },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          style={{ x, opacity }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
          >
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Para negocios que piensan diferente.
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-tight text-foreground">
              VENTAS AL POR MAYOR
            </h2>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-sm uppercase tracking-wider font-semibold text-muted-foreground">A partir de</p>
              <motion.span
                className="text-5xl font-extrabold text-white px-4 py-2 rounded-lg inline-block navy-gradient pulse-glow-navy"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                6
              </motion.span>
              <p className="text-sm uppercase tracking-wider font-semibold text-muted-foreground">unidades</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {features.map((f: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <f.icon size={24} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href="/mayoristas"
                className="group inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md transition-all duration-300"
                style={{ background: "#1B2B5E" }}
              >
                Compras Más. Ganas Más.
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="relative aspect-square max-w-[500px] mx-auto"
            style={{ perspective: "800px" }}
          >
            <motion.div
              animate={{ rotateY: [0, 5, 0, -5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Image
                src="/images/ventas-mayoristas.png"
                alt="Ventas al por mayor CASTOM.CO"
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-2 -right-2 px-4 py-2 rounded-lg bg-card shadow-lg border border-border/50 flex items-center gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "translateZ(30px)" }}
            >
              <TrendingDown size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Hasta 40% OFF</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
