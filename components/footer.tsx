import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t" style={{ background: "#1B2B5E", color: "white" }}>
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold font-display tracking-tight mb-2">
              CASTOM<span className="text-sm">.CO</span>
            </h3>
            <p className="text-sm opacity-70 font-mono uppercase tracking-widest">
              Built Different. Made For You.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 opacity-80">Navegación</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/tienda" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Tienda</Link>
              <Link href="/mayoristas" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Mayoristas</Link>
              <Link href="/contacto" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contacto</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3 opacity-80">Contacto</h4>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Globe size={16} />
              <span>castom.co</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs opacity-50">CASTOM.CO ® — Todos los derechos reservados</p>
          <p className="text-xs opacity-50 font-mono">DISPONIBLE EN CASTOM.CO</p>
        </div>
      </div>
    </footer>
  );
}
