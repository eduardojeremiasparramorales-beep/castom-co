"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Cpu, Shirt, Watch, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons: Record<string, any> = {
  tecnologia: Cpu,
  ropa: Shirt,
  accesorios: Watch,
  otros: Package,
};

const categoryColors: Record<string, string> = {
  tecnologia: "#1B2B5E",
  ropa: "#2D4A8E",
  accesorios: "#3D5CA0",
  otros: "#4D6DB0",
};

export function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: any) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-foreground">
            Categorías
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-muted-foreground"
          >
            Explora nuestro catálogo por categoría
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(categories ?? []).map((cat: any, i: number) => {
            const IconComp = categoryIcons[cat?.slug ?? ""] ?? Package;
            const bgColor = categoryColors[cat?.slug ?? ""] ?? "#1B2B5E";
            return (
              <motion.div
                key={cat?.id ?? i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
                style={{ perspective: "800px" }}
              >
                <Link
                  href={`/tienda?category=${cat?.slug ?? ""}`}
                  className="group block rounded-lg p-6 md:p-8 text-white text-center transition-all duration-500"
                  style={{
                    background: bgColor,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <motion.div
                    className="inline-block"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <IconComp size={32} className="mx-auto mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <h3 className="font-bold text-lg uppercase tracking-wider" style={{ transform: "translateZ(20px)" }}>
                    {cat?.name ?? ""}
                  </h3>
                  <p className="text-xs opacity-60 mt-1">{cat?._count?.products ?? 0} productos</p>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-center gap-1 mt-3 text-sm font-semibold"
                  >
                    Explorar <ArrowRight size={14} />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
