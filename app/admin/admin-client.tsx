"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Package, ShoppingBag, Plus, Edit, Eye, EyeOff, Loader2, X, Upload, Users, Tags,
  Check, XCircle, TrendingUp, DollarSign, AlertTriangle, Download, FileText,
  BarChart3, UserCheck, Calendar, Search, ChevronDown, Clock, MessageSquare,
  PieChart, ArrowUp, ArrowDown, Zap, Box, Activity
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

const COLORS = ["#1B2B5E", "#2D4A8E", "#3D5CA0", "#4D6DB0", "#6B8BCE", "#8BA8E0", "#4CAF50", "#FF9800"];

export function AdminClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "customers" | "requests" | "pricetiers">("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, catRes, reqRes, custRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/categories"),
        fetch("/api/admin/wholesale-requests"),
        fetch("/api/admin/customers").catch(() => ({ json: () => [] })),
      ]);
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const catData = await catRes.json();
      const reqData = await reqRes.json();
      const custData = await custRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p ?? 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });

  // Dashboard calculations
  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.filter((o: any) => o.status !== "cancelado").reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const lowStockItems = products.filter((p: any) => p.stock != null && p.stock > 0 && p.stock <= 5);
    const outOfStock = products.filter((p: any) => p.stock === 0 || p.stock == null);

    // Monthly sales data
    const monthlyData: Record<string, { month: string; sales: number; orders: number }> = {};
    orders.forEach((o: any) => {
      if (o.status === "cancelado") return;
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }), sales: 0, orders: 0 };
      }
      monthlyData[key].sales += o.total || 0;
      monthlyData[key].orders += 1;
    });

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockItems,
      outOfStock,
      monthlyChart: Object.values(monthlyData).slice(-12),
      recentOrders: [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    };
  }, [orders, customers, products]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (orderFilter !== "all") {
      list = list.filter((o: any) => o.status === orderFilter);
    }
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      list = list.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, orderFilter, orderSearch]);

  const exportOrders = () => {
    const headers = ["Pedido", "Cliente", "Email", "Total", "Estado", "Método Pago", "Fecha"];
    const rows = orders.map((o: any) => [
      o.orderNumber, o.customerName, o.customerEmail, o.total, o.status, o.paymentMethod,
      new Date(o.createdAt).toLocaleDateString("es-CO"),
    ]);
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-castom-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Pedidos exportados");
  };

  // Orders for today
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);
  }, [orders]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B5E" }}>Acceso Denegado</h1>
        <p className="mt-2 opacity-50">No tienes permisos de administrador.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight" style={{ color: "#1B2B5E" }}>
            Panel de Administración
          </h1>
          <p className="text-sm opacity-50 mt-1">Bienvenido, {session?.user?.name || "Admin"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-40">{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<BarChart3 size={16} />} label="Dashboard" />
        <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package size={16} />} label={`Productos (${products?.length ?? 0})`} />
        <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<ShoppingBag size={16} />} label={`Pedidos (${orders?.length ?? 0})`} />
        <TabButton active={activeTab === "customers"} onClick={() => setActiveTab("customers")} icon={<Users size={16} />} label={`Clientes (${customers?.length ?? 0})`} />
        <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} icon={<UserCheck size={16} />} label={`Solicitudes (${requests?.length ?? 0})`} />
        <TabButton active={activeTab === "pricetiers"} onClick={() => setActiveTab("pricetiers")} icon={<Tags size={16} />} label="Niveles de Precio" />
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <DashboardTab
          stats={dashboardStats}
          orderStatusData={orderStatusData}
          todayOrders={todayOrders}
          formatPrice={formatPrice}
        />
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <ProductsTab
          products={products}
          loading={loading}
          categories={categories}
          showForm={showForm}
          editingProduct={editingProduct}
          formatPrice={formatPrice}
          onToggleActive={async (id: string, active: boolean) => {
            try {
              await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
              fetchData();
              toast.success(active ? "Producto desactivado" : "Producto activado");
            } catch { toast.error("Error al actualizar"); }
          }}
          onUpdateStock={async (id: string, stock: number) => {
            try {
              await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock }) });
              fetchData();
              toast.success("Stock actualizado");
            } catch { toast.error("Error al actualizar stock"); }
          }}
          onNewProduct={() => { setEditingProduct(null); setShowForm(true); }}
          onEditProduct={(p: any) => { setEditingProduct(p); setShowForm(true); }}
          onCloseForm={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); fetchData(); }}
        />
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <OrdersTab
          orders={filteredOrders}
          loading={loading}
          formatPrice={formatPrice}
          formatDate={formatDate}
          search={orderSearch}
          onSearchChange={setOrderSearch}
          filter={orderFilter}
          onFilterChange={setOrderFilter}
          onExport={exportOrders}
          onUpdateStatus={async (id: string, data: any) => {
            try {
              await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
              fetchData();
              toast.success("Pedido actualizado");
            } catch { toast.error("Error al actualizar pedido"); }
          }}
        />
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <CustomersTab customers={customers} loading={loading} formatPrice={formatPrice} formatDate={formatDate} onRefresh={fetchData} />
      )}

      {/* Wholesale Requests Tab */}
      {activeTab === "requests" && (
        <RequestsTab
          requests={requests}
          loading={loading}
          onApprove={async (id: string) => {
            try {
              await fetch(`/api/admin/wholesale-requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
              fetchData();
              toast.success("Solicitud aprobada");
            } catch { toast.error("Error al aprobar"); }
          }}
          onReject={async (id: string) => {
            const notes = prompt("Motivo del rechazo (opcional):");
            try {
              await fetch(`/api/admin/wholesale-requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected", notes: notes ?? null }) });
              fetchData();
              toast.success("Solicitud rechazada");
            } catch { toast.error("Error al rechazar"); }
          }}
        />
      )}

      {/* Price Tiers Tab */}
      {activeTab === "pricetiers" && (
        <PriceTiersPanel products={products} fetchData={fetchData} />
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSaved={() => { setShowForm(false); setEditingProduct(null); fetchData(); }}
        />
      )}
    </div>
  );
}

/* ====== DASHBOARD TAB ====== */
function DashboardTab({ stats, orderStatusData, todayOrders, formatPrice }: {
  stats: any; orderStatusData: any[]; todayOrders: any[]; formatPrice: (p: number) => string;
}) {
  const statusLabels: Record<string, string> = {
    pendiente: "Pendiente", pagado: "Pagado", confirmado: "Confirmado",
    enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={20} />} label="Ingresos Totales" value={formatPrice(stats.totalRevenue)} color="#1B2B5E" />
        <StatCard icon={<ShoppingBag size={20} />} label="Pedidos" value={stats.totalOrders} color="#2D4A8E" />
        <StatCard icon={<Users size={20} />} label="Clientes" value={stats.totalCustomers} color="#3D5CA0" />
        <StatCard icon={<Package size={20} />} label="Productos" value={stats.totalProducts} color="#4D6DB0" />
      </div>

      {/* Today + Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's orders */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Calendar size={14} /> Hoy
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{todayOrders.length} pedidos</span>
          </div>
          {todayOrders.length === 0 ? (
            <p className="text-sm opacity-40 text-center py-4">Sin pedidos hoy</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {todayOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-mono text-xs opacity-60">{o.orderNumber}</span>
                  <span className="font-semibold" style={{ color: "#1B2B5E" }}>{formatPrice(o.total || 0)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    o.status === "pagado" ? "bg-green-100 text-green-700" :
                    o.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                    o.status === "enviado" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" /> Alertas de Stock
            </h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{stats.lowStockItems.length + stats.outOfStock.length}</span>
          </div>
          {stats.lowStockItems.length === 0 && stats.outOfStock.length === 0 ? (
            <p className="text-sm opacity-40 text-center py-4">Sin alertas</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {stats.outOfStock.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Sin stock</span>
                </div>
              ))}
              {stats.lowStockItems.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Quedan {p.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-1.5 mb-3">
            <PieChart size={14} /> Pedidos por Estado
          </h3>
          {orderStatusData.length === 0 ? (
            <p className="text-sm opacity-40 text-center py-4">Sin datos</p>
          ) : (
            <div className="flex items-center gap-4 h-[180px]">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {orderStatusData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {orderStatusData.slice(0, 4).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="opacity-60">{statusLabels[d.name] || d.name}</span>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#1B2B5E" }}>
            <TrendingUp size={16} /> Ventas Mensuales
          </h3>
        </div>
        {stats.monthlyChart.length === 0 ? (
          <p className="text-sm opacity-40 text-center py-8">Sin datos de ventas</p>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyChart}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B2B5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => [new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value), "Ventas"]} />
                <Area type="monotone" dataKey="sales" stroke="#1B2B5E" strokeWidth={2} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction icon={<Plus size={16} />} label="Nuevo Producto" onClick={() => {}} />
        <QuickAction icon={<Download size={16} />} label="Exportar Datos" onClick={() => {}} />
        <QuickAction icon={<UserCheck size={16} />} label="Solicitudes" onClick={() => {}} />
        <QuickAction icon={<Zap size={16} />} label="Actualizar" onClick={() => {}} />
      </div>
    </div>
  );
}

/* ====== PRODUCTS TAB ====== */
function ProductsTab({ products, loading, categories, showForm, editingProduct, formatPrice, onToggleActive, onUpdateStock, onNewProduct, onEditProduct, onCloseForm, onSaved }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg" style={{ color: "#1B2B5E" }}>Productos</h2>
        <button
          onClick={onNewProduct}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-md"
          style={{ background: "#1B2B5E" }}
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Producto</th>
                <th className="text-left p-3 font-semibold">Categoría</th>
                <th className="text-right p-3 font-semibold">Precio</th>
                <th className="text-right p-3 font-semibold">Mayorista</th>
                <th className="text-right p-3 font-semibold">Stock</th>
                <th className="text-center p-3 font-semibold">Estado</th>
                <th className="text-center p-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(products ?? []).map((p: any) => {
                const isLow = p.stock != null && p.stock > 0 && p.stock <= 5;
                const isOut = p.stock === 0 || p.stock == null;
                return (
                  <tr key={p?.id} className={`border-b hover:bg-gray-50 ${isOut ? "bg-red-50" : isLow ? "bg-amber-50" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p?.images?.[0]?.url && (
                          <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold" style={{ color: "#1B2B5E" }}>{p?.name ?? ""}</span>
                          <p className="text-xs opacity-40 font-mono">{p?.sku ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 opacity-60">{p?.category?.name ?? ""}</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(p?.price ?? 0)}</td>
                    <td className="p-3 text-right">{p?.wholesalePrice ? formatPrice(p.wholesalePrice) : "-"}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isOut && <AlertTriangle size={12} className="text-red-500" />}
                        {isLow && <AlertTriangle size={12} className="text-amber-500" />}
                        <input
                          type="number"
                          defaultValue={p?.stock ?? 0}
                          className={`w-16 px-2 py-1 border rounded text-right text-sm ${isOut ? "border-red-300" : isLow ? "border-amber-300" : ""}`}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val !== p?.stock) onUpdateStock(p?.id, val);
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${p?.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {p?.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onEditProduct(p)} className="p-1.5 rounded hover:bg-gray-100" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => onToggleActive(p?.id, p?.active)} className="p-1.5 rounded hover:bg-gray-100" title={p?.active ? "Desactivar" : "Activar"}>
                          {p?.active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ====== ORDERS TAB ====== */
function OrdersTab({ orders, loading, formatPrice, formatDate, search, onSearchChange, filter, onFilterChange, onExport, onUpdateStatus }: any) {
  const statusLabels: Record<string, string> = {
    pendiente: "Pendiente", pagado: "Pagado", confirmado: "Confirmado",
    enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-lg" style={{ color: "#1B2B5E" }}>Pedidos</h2>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text" placeholder="Buscar pedido..."
              value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 border rounded-md text-sm w-48" />
          </div>
          {/* Filter */}
          <select value={filter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange(e.target.value)} className="px-2 py-1.5 border rounded-md text-sm">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={onExport} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md border hover:bg-gray-50">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
      ) : orders.length === 0 ? (
        <p className="text-center py-8 opacity-50">No hay pedidos</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const isManual = order?.paymentMethod === "transfer" || order?.paymentMethod === "contraentrega";
            return (
              <div key={order?.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono" style={{ color: "#1B2B5E" }}>{order?.orderNumber ?? ""}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      order?.status === "pagado" ? "bg-green-100 text-green-700" :
                      order?.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                      order?.status === "confirmado" ? "bg-blue-100 text-blue-700" :
                      order?.status === "enviado" ? "bg-purple-100 text-purple-700" :
                      order?.status === "entregado" ? "bg-green-100 text-green-700" :
                      order?.status === "cancelado" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {statusLabels[order?.status] || order?.status}
                    </span>
                    {order?.paymentMethod && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100">
                        {order.paymentMethod === "transfer" ? "Transferencia" :
                         order.paymentMethod === "contraentrega" ? "Contraentrega" : "Nequi"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-50">{formatDate(order?.createdAt)}</span>
                </div>
                <div className="text-sm space-y-0.5">
                  <p><strong>Cliente:</strong> {order?.customerName ?? ""} <span className="opacity-50">({order?.customerEmail ?? ""})</span></p>
                  {order?.shippingAddress && <p><strong>Dirección:</strong> {order.shippingAddress}, {order?.city ?? ""}</p>}
                  {(order?.items ?? []).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-xs opacity-60 cursor-pointer hover:opacity-100">Ver items ({order.items.length})</summary>
                      <div className="mt-1 space-y-0.5">
                        {order.items.map((item: any) => (
                          <p key={item?.id} className="text-xs opacity-60">
                            {item?.productName ?? ""} {item?.variantName ? `(${item.variantName})` : ""} x{item?.quantity ?? 0} — {formatPrice(item?.totalPrice ?? 0)}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <span className="text-xs opacity-40">
                    {order?.paymentStatus === "paid" ? "✓ Pagado" : order?.paymentStatus === "pending" ? "⏳ Pendiente" : ""}
                  </span>
                  <span className="font-bold" style={{ color: "#1B2B5E" }}>{formatPrice(order?.total ?? 0)}</span>
                </div>
                {(isManual || order?.status !== "entregado") && order?.status !== "cancelado" && (
                  <div className="mt-3 pt-3 border-t flex gap-2 flex-wrap">
                    {order?.status !== "pagado" && order?.status !== "entregado" && (
                      <button onClick={() => onUpdateStatus(order.id, { status: "pagado", paymentStatus: "paid" })}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-green-100 text-green-700 hover:bg-green-200">Marcar Pagado</button>
                    )}
                    {order?.status === "pagado" && (
                      <button onClick={() => onUpdateStatus(order.id, { status: "enviado" })}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200">Marcar Enviado</button>
                    )}
                    {order?.status === "enviado" && (
                      <button onClick={() => onUpdateStatus(order.id, { status: "entregado" })}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-green-100 text-green-700 hover:bg-green-200">Marcar Entregado</button>
                    )}
                    {order?.status !== "cancelado" && order?.status !== "entregado" && (
                      <button onClick={() => onUpdateStatus(order.id, { status: "cancelado" })}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-red-100 text-red-600 hover:bg-red-200">Cancelar</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ====== CUSTOMERS TAB ====== */
function CustomersTab({ customers, loading, formatPrice, formatDate, onRefresh }: any) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c: any) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg" style={{ color: "#1B2B5E" }}>Clientes</h2>
        <input type="text" placeholder="Buscar cliente..." value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm w-64" />
      </div>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 opacity-50">No hay clientes registrados</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Cliente</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Empresa</th>
                <th className="text-center p-3 font-semibold">Mayorista</th>
                <th className="text-center p-3 font-semibold">Pedidos</th>
                <th className="text-right p-3 font-semibold">Total Gastado</th>
                <th className="text-center p-3 font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold" style={{ color: "#1B2B5E" }}>{c.name || "Sin nombre"}</td>
                  <td className="p-3 opacity-60">{c.email}</td>
                  <td className="p-3">{c.companyName || "-"}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      c.wholesaleStatus === "approved" ? "bg-green-100 text-green-700" :
                      c.wholesaleStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                      c.wholesaleStatus === "rejected" ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {c.wholesaleStatus === "approved" ? "Aprobado" :
                       c.wholesaleStatus === "pending" ? "Pendiente" :
                       c.wholesaleStatus === "rejected" ? "Rechazado" : "No aplica"}
                    </span>
                  </td>
                  <td className="p-3 text-center font-semibold">{c._count?.orders || 0}</td>
                  <td className="p-3 text-right font-semibold" style={{ color: "#1B2B5E" }}>
                    {formatPrice(c._sum?.orders?.total || 0)}
                  </td>
                  <td className="p-3 text-center text-xs opacity-50">{c.createdAt ? formatDate(c.createdAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ====== REQUESTS TAB ====== */
function RequestsTab({ requests, loading, onApprove, onReject }: any) {
  return (
    <div>
      <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Solicitudes Mayoristas</h2>
      {loading ? (
        <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
      ) : (requests ?? []).length === 0 ? (
        <p className="text-center py-8 opacity-50">No hay solicitudes</p>
      ) : (
        <div className="space-y-4">
          {(requests ?? []).map((req: any) => (
            <div key={req?.id} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold" style={{ color: "#1B2B5E" }}>{req?.companyName ?? ""}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  req?.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  req?.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {req?.status === "pending" ? "Pendiente" : req?.status === "approved" ? "Aprobado" : "Rechazado"}
                </span>
              </div>
              <p className="text-sm"><strong>NIT:</strong> {req?.companyNIT ?? ""}</p>
              <p className="text-sm"><strong>Contacto:</strong> {req?.user?.name ?? ""} ({req?.user?.email ?? ""})</p>
              <p className="text-sm"><strong>Ubicación:</strong> {req?.city ?? ""}, {req?.department ?? ""}</p>
              {req?.companyPhone && <p className="text-sm"><strong>Teléfono:</strong> {req.companyPhone}</p>}
              <p className="text-xs opacity-50 mt-1">{req?.createdAt ? new Date(req.createdAt).toLocaleDateString("es-CO") : ""}</p>
              {req?.notes && <p className="text-xs mt-1 p-2 bg-gray-50 rounded"><strong>Notas:</strong> {req.notes}</p>}
              {req?.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onApprove(req.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md bg-green-100 text-green-700 hover:bg-green-200">
                    <Check size={14} /> Aprobar
                  </button>
                  <button onClick={() => onReject(req.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-md bg-red-100 text-red-600 hover:bg-red-200">
                    <XCircle size={14} /> Rechazar
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

/* ====== PRICE TIERS ====== */
function PriceTiersPanel({ products, fetchData }: { products: any[]; fetchData: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProduct) { setTiers([]); return; }
    setLoading(true);
    fetch(`/api/admin/price-tiers?productId=${selectedProduct}`)
      .then((r) => r.json())
      .then((data) => setTiers(Array.isArray(data) ? data : []))
      .catch(() => setTiers([]))
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  return (
    <div>
      <h2 className="font-bold text-lg mb-4" style={{ color: "#1B2B5E" }}>Niveles de Precio por Volumen</h2>
      <div className="bg-white p-4 rounded-lg border mb-4">
        <label className="text-sm font-semibold block mb-2">Producto</label>
        <select value={selectedProduct} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProduct(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm">
          <option value="">Seleccionar producto...</option>
          {(products ?? []).map((p: any) => (
            <option key={p?.id} value={p?.id}>{p?.name ?? ""} ({p?.sku ?? ""})</option>
          ))}
        </select>
      </div>
      {selectedProduct && (
        <div className="bg-white p-4 rounded-lg border">
          {loading ? (
            <div className="text-center py-4"><Loader2 className="animate-spin mx-auto" /></div>
          ) : (
            <>
              {tiers.length === 0 && <p className="text-sm opacity-50 mb-4">Sin niveles configurados.</p>}
              <div className="space-y-3">
                {tiers.map((tier: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <label className="text-xs font-semibold">Mín</label>
                      <input type="number" value={tier.minQty} min={1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newTiers = [...tiers]; newTiers[i].minQty = parseInt(e.target.value) || 1; setTiers(newTiers);
                      }} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold">Máx</label>
                      <input type="number" value={tier.maxQty ?? ""} min={0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newTiers = [...tiers]; newTiers[i].maxQty = e.target.value ? parseInt(e.target.value) : null; setTiers(newTiers);
                      }} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold">Precio</label>
                      <input type="number" value={tier.price} min={0} step={100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newTiers = [...tiers]; newTiers[i].price = parseFloat(e.target.value) || 0; setTiers(newTiers);
                      }} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <button onClick={() => setTiers((prev: any) => prev.filter((_: any, idx: number) => idx !== i))} className="mt-4 p-1.5 hover:bg-red-100 rounded text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setTiers((prev: any) => [...prev, { minQty: 1, maxQty: null, price: 0, membershipLevel: null }])}
                  className="px-3 py-1.5 text-xs font-bold rounded-md border hover:bg-gray-50">+ Agregar Nivel</button>
                <button onClick={async () => {
                  if (!selectedProduct) return;
                  try {
                    const res = await fetch("/api/admin/price-tiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: selectedProduct, tiers }) });
                    if (res.ok) { toast.success("Niveles guardados"); fetchData(); } else toast.error("Error al guardar");
                  } catch { toast.error("Error al guardar"); }
                }} className="px-4 py-1.5 text-xs font-bold rounded-md text-white" style={{ background: "#1B2B5E" }}>Guardar Niveles</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ====== PRODUCT FORM ====== */
function ProductFormModal({ product, categories, onClose, onSaved }: { product: any; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    wholesalePrice: product?.wholesalePrice?.toString() ?? "",
    wholesaleMinQty: product?.wholesaleMinQty ?? 6,
    sku: product?.sku ?? "",
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? (categories?.[0]?.id ?? ""),
    featured: product?.featured ?? false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>((product?.images ?? []).map((img: any) => img?.url ?? ""));
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await fetch("/api/upload/presigned", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }) });
      const { uploadUrl, cloud_storage_path } = await res.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      const urlRes = await fetch("/api/upload/get-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cloud_storage_path, contentType: file.type, isPublic: true }) });
      const { url } = await urlRes.json();
      setImageUrls((prev: string[]) => [...prev, url]);
      toast.success("Imagen subida exitosamente");
    } catch { toast.error("Error al subir imagen"); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.sku || !form.categoryId) { toast.error("Completa los campos requeridos"); return; }
    setLoading(true);
    try {
      const payload = { ...form, images: imageUrls.map((url: string, i: number) => ({ url, alt: form.name, position: i, isPublic: true })) };
      if (isEdit) {
        await fetch(`/api/admin/products/${product.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Producto actualizado");
      } else {
        await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Producto creado");
      }
      onSaved();
    } catch { toast.error("Error al guardar"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1B2B5E" }}>{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Nombre *</label>
              <input type="text" required value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">SKU *</label>
              <input type="text" required value={form.sku} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Precio *</label>
              <input type="number" required value={form.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Precio Mayorista</label>
              <input type="number" value={form.wholesalePrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wholesalePrice: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Mínimo Mayorista</label>
              <input type="number" value={form.wholesaleMinQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, wholesaleMinQty: parseInt(e.target.value) || 6 })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Categoría *</label>
              <select value={form.categoryId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
                {(categories ?? []).map((c: any) => <option key={c?.id} value={c?.id}>{c?.name ?? ""}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.featured} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
              <label className="text-sm font-semibold">Destacado</label>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm h-20 resize-none" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-2">Imágenes</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {(imageUrls ?? []).map((url: string, i: number) => (
                <div key={i} className="relative w-16 h-16 rounded border overflow-hidden group">
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                  <button type="button" onClick={() => setImageUrls((prev: string[]) => prev.filter((_: string, idx: number) => idx !== i))}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} className="text-white" /></button>
                </div>
              ))}
              <label className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-gray-50">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="opacity-40" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleUploadImage(file); }} />
              </label>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="O pega URL de imagen" value={newImageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-md text-sm" />
              <button type="button" onClick={() => { if (newImageUrl) { setImageUrls((prev: string[]) => [...prev, newImageUrl]); setNewImageUrl(""); } }} className="px-3 py-1.5 text-xs font-bold rounded-md border hover:bg-gray-50">Agregar</button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-md hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-md disabled:opacity-50" style={{ background: "#1B2B5E" }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null} {isEdit ? "Actualizar" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ====== UI COMPONENTS ====== */
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${
      active ? "text-white shadow-md" : "text-gray-600 bg-white border hover:bg-gray-50"
    }`} style={active ? { background: "#1B2B5E" } : {}}>
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-xs opacity-50 uppercase tracking-wider font-semibold">{label}</p>
          <p className="text-xl font-bold" style={{ color }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border text-sm font-semibold hover:bg-gray-50 hover:shadow-md transition-all">
      <span className="opacity-40">{icon}</span> {label}
    </button>
  );
}
