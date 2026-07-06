"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { getCart } from "@/lib/cart";

export function Header() {
  const { data: session, status } = useSession() || {};
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCart = () => {
      const items = getCart();
      setCartCount(items?.reduce((acc: number, i: any) => acc + (i?.quantity ?? 0), 0) ?? 0);
    };
    updateCart();
    window.addEventListener("cart-updated", updateCart);
    window.addEventListener("storage", updateCart);
    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("storage", updateCart);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg"
          : "bg-transparent"
      }`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display group">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight transition-colors duration-300" style={{ color: scrolled ? "#1B2B5E" : "white" }}>
            CASTOM<span className="text-sm font-bold">.CO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {["Tienda", "Tecnología", "Ropa", "Accesorios", "Mayoristas"].map((item) => {
            const href = item === "Tienda" ? "/tienda" : item === "Mayoristas" ? "/mayoristas" : `/tienda?category=${item.toLowerCase()}`;
            return (
              <Link
                key={item}
                href={href}
                className="text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:opacity-70 relative group/link"
                style={{ color: scrolled ? "#1B2B5E" : "white" }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current opacity-0 group-hover/link:opacity-30 transition-opacity duration-300" />
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {status === "authenticated" && (
            <>
              <Link
                href="/mis-pedidos"
                className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase px-3 py-1.5 rounded-md border transition-all duration-300 hover:bg-white/10"
                style={{
                  borderColor: scrolled ? "#1B2B5E" : "rgba(255,255,255,0.3)",
                  color: scrolled ? "#1B2B5E" : "white",
                }}
              >
                <Package size={14} />
                Mis Pedidos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1 text-xs font-bold uppercase px-3 py-1.5 rounded-md transition-all duration-300"
                  style={{
                    background: scrolled ? "#1B2B5E" : "rgba(255,255,255,0.15)",
                    color: "white",
                    backdropFilter: scrolled ? "none" : "blur(4px)",
                  }}
                >
                  <LayoutDashboard size={14} />
                  Admin
                </Link>
              )}
            </>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut?.({ callbackUrl: "/" })}
              className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase px-3 py-1.5 rounded-md border transition-all duration-300 hover:bg-white/10"
              style={{
                borderColor: scrolled ? "#1B2B5E" : "rgba(255,255,255,0.3)",
                color: scrolled ? "#1B2B5E" : "white",
              }}
            >
              <LogOut size={14} />
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase px-3 py-1.5 rounded-md border transition-all duration-300 hover:bg-white/10"
              style={{
                borderColor: scrolled ? "#1B2B5E" : "rgba(255,255,255,0.3)",
                color: scrolled ? "#1B2B5E" : "white",
              }}
            >
              <User size={14} />
              Ingresar
            </Link>
          )}

          <Link
            href="/carrito"
            className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white/10"
            style={{ color: scrolled ? "#1B2B5E" : "white" }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center animate-scale-in"
                style={{ background: "#1B2B5E" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: scrolled ? "#1B2B5E" : "white" }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 pb-4 shadow-lg animate-fade-in-up"
          style={{
            background: scrolled ? "white" : "rgba(27, 43, 94, 0.95)",
            backdropFilter: "blur(20px)",
            borderColor: scrolled ? "var(--border)" : "rgba(255,255,255,0.1)",
          }}
        >
          <nav className="flex flex-col gap-3 pt-3">
            {[
              { label: "Tienda", href: "/tienda" },
              { label: "Tecnología", href: "/tienda?category=tecnologia" },
              { label: "Ropa", href: "/tienda?category=ropa" },
              { label: "Accesorios", href: "/tienda?category=accesorios" },
              { label: "Mayoristas", href: "/mayoristas" },
              ...(status === "authenticated" ? [{ label: "Mis Pedidos", href: "/mis-pedidos" }] : []),
              ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold uppercase py-2 transition-opacity hover:opacity-70"
                style={{ color: scrolled ? "#1B2B5E" : "white" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t pt-3" style={{ borderColor: scrolled ? "var(--border)" : "rgba(255,255,255,0.1)" }}>
              {status === "authenticated" ? (
                <button
                  onClick={() => { signOut?.({ callbackUrl: "/" }); setMenuOpen(false); }}
                  className="text-sm font-semibold uppercase py-2 text-left w-full transition-opacity hover:opacity-70"
                  style={{ color: scrolled ? "#1B2B5E" : "white" }}
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-semibold uppercase py-2 transition-opacity hover:opacity-70"
                  style={{ color: scrolled ? "#1B2B5E" : "white" }}
                >
                  Ingresar
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
