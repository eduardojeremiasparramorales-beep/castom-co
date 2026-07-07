"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Package, ShoppingBag, TrendingUp, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente", pagado: "Pagado", confirmado: "Confirmado",
  enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
};

const statusFlow = ["pendiente", "pagado", "enviado", "entregado"];

export function SellerPage() {
  const { data: session, status: authStatus } = useSession() || {};
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.replace("/login"); return; }
    if (authStatus === "authenticated" && role !== "admin" && role !== "seller") {
      router.replace("/");
    }
  }, [authStatus, role, router]);

  useEffect(() => {
    if (role !== "admin" && role !== "seller") return;
    fetch("/api/seller/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => toast.error("Error al cargar pedidos"))
      .finally(() => setLoading(false));
  }, [role]);

  const updateStatus = async (id: string, data: any) => {
    try {
      await fetch(`/api/seller/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const updated = orders.map((o: any) => o.id === id ? { ...o, ...data } : o);
      setOrders(updated);
      toast.success("Estado actualizado");
    } catch { toast.error("Error al actualizar"); }
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (filter !== "all") list = list.filter((o: any) => o.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    today: todayOrders.length,
    revenue: orders.filter((o: any) => o.status !== "cancelado").reduce((s: number, o: any) => s + (o.total || 0), 0),
    pending: orders.filter((o: any) => o.status === "pendiente" || o.status === "pagado").length,
  }), [orders, todayOrders]);

  if (authStatus === "loading") {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (!session || (role !== "admin" && role !== "seller")) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pt-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">
            Panel de Vendedor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Bienvenido, {session?.user?.name || "Vendedor"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground transition-all"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <span>☀️</span> : <span>🌙</span>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="liquid-glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary-light"><ShoppingBag size={20} /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Pedidos</p><p className="text-xl font-bold text-foreground">{stats.total}</p></div>
          </div>
        </div>
        <div className="liquid-glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary-light"><TrendingUp size={20} /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hoy</p><p className="text-xl font-bold text-foreground">{stats.today}</p></div>
          </div>
        </div>
        <div className="liquid-glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/20 text-success"><DollarSign size={20} /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ingresos</p><p className="text-xl font-bold text-foreground">{formatPrice(stats.revenue)}</p></div>
          </div>
        </div>
        <div className="liquid-glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/20 text-warning"><Users size={20} /></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pendientes</p><p className="text-xl font-bold text-foreground">{stats.pending}</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-lg text-foreground">Pedidos</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-secondary border border-input rounded-lg text-sm text-foreground w-48 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={filter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
            className="px-2 py-1.5 bg-secondary border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Order list */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" size={28} /></div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No hay pedidos</p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="liquid-glass-card p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-foreground">{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    order.status === "pagado" || order.status === "entregado" ? "bg-success/20 text-success" :
                    order.status === "pendiente" ? "bg-warning/20 text-warning" :
                    order.status === "cancelado" ? "bg-destructive/20 text-destructive-foreground" :
                    "bg-primary/20 text-primary-light"
                  }`}>{statusLabels[order.status] || order.status}</span>
                  {order.paymentMethod && (
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {order.paymentMethod === "transfer" ? "Transferencia" :
                       order.paymentMethod === "contraentrega" ? "Contraentrega" : "Nequi"}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>

              <div className="text-sm space-y-0.5 text-foreground">
                <p><strong>Cliente:</strong> {order.customerName} <span className="text-muted-foreground">({order.customerEmail})</span></p>
                {order.customerPhone && <p><strong>Tel:</strong> {order.customerPhone}</p>}
                {order.shippingAddress && <p><strong>Dirección:</strong> {order.shippingAddress}, {order.city ?? ""}</p>}
                {order.items?.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Ver items ({order.items.length})</summary>
                    <div className="mt-1 space-y-0.5">
                      {order.items.map((item: any) => (
                        <p key={item.id} className="text-xs text-muted-foreground">
                          {item.productName} {item.variantName ? `(${item.variantName})` : ""} x{item.quantity} — {formatPrice(item.totalPrice)}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              <div className="border-t border-border/30 pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {order.paymentStatus === "paid" ? "✓ Pagado" : order.paymentStatus === "pending" ? "⏳ Pendiente pago" : ""}
                  {order.notes && <span className="ml-2">| Nota: {order.notes}</span>}
                </span>
                <span className="font-bold text-foreground">{formatPrice(order.total || 0)}</span>
              </div>

              {order.status !== "entregado" && order.status !== "cancelado" && (
                <div className="mt-3 pt-3 border-t border-border/30 flex gap-2 flex-wrap">
                  {statusFlow.indexOf(order.status) < statusFlow.indexOf("entregado") && (
                    (() => {
                      const nextStatus = statusFlow[statusFlow.indexOf(order.status) + 1];
                      const nextLabel = statusLabels[nextStatus];
                      return (
                        <button onClick={() => updateStatus(order.id, { status: nextStatus, ...(nextStatus === "pagado" ? { paymentStatus: "paid" } : {}) })}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-success/20 text-success hover:bg-success/30 transition-all">
                          Marcar {nextLabel}
                        </button>
                      );
                    })()
                  )}
                  <button onClick={() => updateStatus(order.id, { status: "cancelado" })}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-destructive/20 text-destructive-foreground hover:bg-destructive/30 transition-all">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
