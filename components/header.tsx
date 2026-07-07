"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Package, Sun, Moon } from "lucide-react";
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
  const isSeller = (session?.user as any)?.role === "seller";
  const { theme, setTheme } = useTheme();

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-nav shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display group">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white text-glow">
            CASTOM<span className="text-sm font-bold opacity-60">.CO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["Tienda", "Tecnología", "Ropa", "Accesorios", "Mayoristas"].map((item) => {
            const href = item === "Tienda" ? "/tienda" : item === "Mayoristas" ? "/mayoristas" : `/tienda?category=${item.toLowerCase()}`;
            return (
              <Link
                key={item}
                href={href}
                className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-all duration-300 relative group/link"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary/60 group-hover/link:w-full transition-all duration-300 rounded-full" />
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
                className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-300"
              >
                <Package size={13} />
                Mis Pedidos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-primary/30 text-white hover:bg-primary/50 transition-all duration-300"
                >
                  <LayoutDashboard size={13} />
                  Admin
                </Link>
              )}
              {isSeller && (
                <Link
                  href="/vendedor"
                  className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-primary/30 text-white hover:bg-primary/50 transition-all duration-300"
                >
                  <LayoutDashboard size={13} />
                  Vendedor
                </Link>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {status === "authenticated" ? (
            <button
              onClick={() => signOut?.({ callbackUrl: "/" })}
              className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-300"
            >
              <LogOut size={13} />
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-300"
            >
              <User size={13} />
              Ingresar
            </Link>
          )}

          <Link
            href="/carrito"
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center animate-scale-in shadow-lg"
                style={{ background: "#1B2B5E" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/5 px-4 pb-6 shadow-2xl backdrop-blur-2xl"
          style={{ background: "hsl(230 10% 4% / 0.95)" }}
        >
          <nav className="flex flex-col gap-1 pt-4">
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
                className="text-sm font-bold uppercase tracking-wider py-3 px-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/5 mt-2 pt-2">
              {status === "authenticated" ? (
                <button
                  onClick={() => { signOut?.({ callbackUrl: "/" }); setMenuOpen(false); }}
                  className="w-full text-left text-sm font-bold uppercase tracking-wider py-3 px-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-bold uppercase tracking-wider py-3 px-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
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
