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
    <section className="py-16 md:py-24 relative">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="text-center mb-12"
        >
          <motion.div
            className="flex items-center justify-center gap-2 mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles size={20} style={{ color: "#1B2B5E" }} className="animate-pulse" />
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-50">Destacados</p>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
            Productos Destacados
          </h2>
          <motion.p
            className="mt-2 opacity-50 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Lo más popular de CASTOM.CO
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
              </motion.div>
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 staggered-fade-in">
            {(products ?? []).map((product: any, i: number) => (
              <motion.div
                key={product?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.2, 0, 0, 1],
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center opacity-50"
          >
            Próximamente más productos
          </motion.p>
        )}
      </div>
    </section>
  );
}
