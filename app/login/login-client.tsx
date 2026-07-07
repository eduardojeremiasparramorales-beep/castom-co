"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn?.("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Credenciales inválidas");
      } else {
        router.replace("/");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground text-glow">
              CASTOM<span className="text-sm opacity-50">.CO</span>
            </h1>
          </Link>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mt-2">Built Different. Made For You.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 text-foreground">Iniciar Sesión</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-muted-foreground">Email</label>
              <input
                type="email" required value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-muted-foreground">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-secondary border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-300 shadow-glow"
              style={{ background: "#1B2B5E" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Ingresar
            </button>
          </div>
          <p className="text-center text-sm mt-6 text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-primary hover:text-primary-light transition-colors">Registrarse</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
