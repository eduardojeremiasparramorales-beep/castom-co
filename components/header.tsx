"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { getCart } from "@/lib/cart";

export function Header() {
  const { data: session, status } = useSession() || {};
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display">
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: "#1B2B5E" }}>
            CASTOM<span className="text-sm font-bold">.CO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/tienda" className="text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            Tienda
          </Link>
          <Link href="/tienda?category=tecnologia" className="text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            Tecnología
          </Link>
          <Link href="/tienda?category=ropa" className="text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            Ropa
          </Link>
          <Link href="/tienda?category=accesorios" className="text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            Accesorios
          </Link>
          <Link href="/mayoristas" className="text-sm font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: "#1B2B5E" }}>
            Mayoristas
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {status === "authenticated" && isAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1 text-xs font-bold uppercase px-3 py-1.5 rounded-md transition-colors"
              style={{ background: "#1B2B5E", color: "white" }}
            >
              <LayoutDashboard size={14} />
              Admin
            </Link>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut?.({ callbackUrl: "/" })}
              className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase px-3 py-1.5 rounded-md border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#1B2B5E", color: "#1B2B5E" }}
            >
              <LogOut size={14} />
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase px-3 py-1.5 rounded-md border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#1B2B5E", color: "#1B2B5E" }}
            >
              <User size={14} />
              Ingresar
            </Link>
          )}

          <Link
            href="/carrito"
            className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-gray-100"
          >
            <ShoppingCart size={20} style={{ color: "#1B2B5E" }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ background: "#1B2B5E" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 shadow-lg">
          <nav className="flex flex-col gap-3 pt-3">
            <Link href="/tienda" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Tienda</Link>
            <Link href="/tienda?category=tecnologia" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Tecnología</Link>
            <Link href="/tienda?category=ropa" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Ropa</Link>
            <Link href="/tienda?category=accesorios" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Accesorios</Link>
            <Link href="/mayoristas" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Mayoristas</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Admin</Link>
            )}
            {status === "authenticated" ? (
              <button onClick={() => { signOut?.({ callbackUrl: "/" }); setMenuOpen(false); }} className="text-sm font-semibold uppercase py-2 text-left" style={{ color: "#1B2B5E" }}>Cerrar Sesión</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold uppercase py-2" style={{ color: "#1B2B5E" }}>Ingresar</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
