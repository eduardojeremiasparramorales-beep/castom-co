"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Tag, ShoppingCart, Handshake, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function WholesaleSection() {
  const features = [
    { icon: Package, title: "Productos de Calidad", desc: "Garantía en todos nuestros productos" },
    { icon: Tag, title: "Precios Especiales", desc: "Descuentos exclusivos al por mayor" },
    { icon: ShoppingCart, title: "Stock Disponible", desc: "Siempre listos para despacho" },
    { icon: Handshake, title: "Alianzas que Suman", desc: "Crecemos juntos con tu negocio" },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-50 mb-2">
              Para negocios que piensan diferente.
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-tight" style={{ color: "#1B2B5E" }}>
              VENTAS AL POR MAYOR
            </h2>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-sm uppercase tracking-wider font-semibold opacity-60">A partir de</p>
              <span className="text-5xl font-extrabold text-white px-4 py-2 rounded-lg" style={{ background: "#1B2B5E" }}>6</span>
              <p className="text-sm uppercase tracking-wider font-semibold opacity-60">unidades</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {features.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <f.icon size={24} style={{ color: "#1B2B5E" }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: "#1B2B5E" }}>{f.title}</h4>
                    <p className="text-xs opacity-60 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/mayoristas"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:opacity-90 transition-opacity"
                style={{ background: "#1B2B5E" }}
              >
                Compras Más. Ganas Más.
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square max-w-[500px] mx-auto"
          >
            <Image
              src="/images/ventas-mayoristas.png"
              alt="Ventas al por mayor CASTOM.CO"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
