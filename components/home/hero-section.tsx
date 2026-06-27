"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#1B2B5E" }}>
      <div className="max-w-[1200px] mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/60 text-xs font-mono uppercase tracking-[0.3em] mb-4">
              Built Different. Made For You.
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold font-display text-white tracking-tight leading-[0.9]">
              CASTOM
              <span className="text-xl md:text-2xl">.CO</span>
            </h1>
            <p className="text-white/70 mt-6 text-lg max-w-md">
              Tecnología, ropa y accesorios con estilo. Precios especiales al por mayor a partir de 6 unidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white font-bold text-sm uppercase tracking-wider rounded-md hover:bg-gray-100 transition-colors"
                style={{ color: "#1B2B5E" }}
              >
                Ver Tienda
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/mayoristas"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-bold text-sm uppercase tracking-wider rounded-md hover:bg-white/10 transition-colors"
              >
                <Headphones size={16} />
                Mayoristas
              </Link>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <Image
                src="/images/airpods-lineup.png"
                alt="AirPods CASTOM.CO - Colección completa"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
