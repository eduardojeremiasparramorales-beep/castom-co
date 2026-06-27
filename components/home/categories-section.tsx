"use client";

import { useEffect, useState } from "react";
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
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
            Categorías
          </h2>
          <p className="mt-2 opacity-60">Explora nuestro catálogo por categoría</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(categories ?? []).map((cat: any, i: number) => {
            const IconComp = categoryIcons[cat?.slug ?? ""] ?? Package;
            const bgColor = categoryColors[cat?.slug ?? ""] ?? "#1B2B5E";
            return (
              <motion.div
                key={cat?.id ?? i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/tienda?category=${cat?.slug ?? ""}`}
                  className="group block rounded-lg p-6 md:p-8 text-white text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: bgColor }}
                >
                  <IconComp size={32} className="mx-auto mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <h3 className="font-bold text-lg uppercase tracking-wider">{cat?.name ?? ""}</h3>
                  <p className="text-xs opacity-60 mt-1">{cat?._count?.products ?? 0} productos</p>
                  <ArrowRight size={16} className="mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
