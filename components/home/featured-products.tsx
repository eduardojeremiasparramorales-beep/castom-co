"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then((r) => r.json())
      .then((data: any) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={20} style={{ color: "#1B2B5E" }} />
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-50">Destacados</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
            Productos Destacados
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i: number) => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(products ?? []).map((product: any) => (
              <ProductCard key={product?.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center opacity-50">Próximamente más productos</p>
        )}
      </div>
    </section>
  );
}
