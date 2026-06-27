"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

export function TiendaClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category") ?? "";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: any) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data: any) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchTerm]);

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
            Tienda
          </h1>
          <p className="mt-2 opacity-60">Explora nuestro catálogo completo</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#ddd" }}
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={16} className="opacity-40" />
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                !selectedCategory ? "text-white" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={!selectedCategory ? { background: "#1B2B5E" } : {}}
            >
              Todos
            </button>
            {(categories ?? []).map((cat: any) => (
              <button
                key={cat?.id}
                onClick={() => setSelectedCategory(cat?.slug ?? "")}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                  selectedCategory === cat?.slug ? "text-white" : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                style={selectedCategory === cat?.slug ? { background: "#1B2B5E" } : {}}
              >
                {cat?.name ?? ""}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i: number) => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
            ))}
          </div>
        ) : (products ?? []).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(products ?? []).map((product: any) => (
              <ProductCard key={product?.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg opacity-50">No se encontraron productos</p>
            {(selectedCategory || searchTerm) && (
              <button
                onClick={() => { setSelectedCategory(""); setSearchTerm(""); }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-50"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
