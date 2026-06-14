"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data) || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" },
  out: { bg: "#F3F4F6", color: "#6b7280" },
};
const statusKeys: Record<string, string> = { active: "active", low: "low", critical: "critical", out: "inactive" };

export default function Dashboard() {
  const { t, fmt } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, o, c] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("customers").select("*").order("created_at", { ascending: false }),
      ]);
      setProducts(p.data || []);
      setOrders(o.data || []);
      setCustomers(c.data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Live KPIs
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((a, o) => a + (o.total_dzd || 0), 0);

  // Category breakdown for donut
  const categoryMap: Record<string, number> = {};
  products.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + p.price_dzd * p.stock; });
  const categoryTotal = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const donutColors = ["#C8F000", "#1C1C1C", "#E0E0E0", "#999", "#818cf8", "#FB923C"];
  const donutData = Object.entries(categoryMap).slice(0, 6).map(([name, value], i) => ({
    name, value: Math.round((value / categoryTotal) * 100), color: donutColors[i] || "#aaa"
  }));

  // Monthly revenue from orders
  const monthlyMap: Record<string, number> = {};
  orders.forEach(o => {
    if (o.status === "delivered") {
      const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
      monthlyMap[m] = (monthlyMap[m] || 0) + (o.total_dzd || 0);
    }
  });
  const areaData = Object.entries(monthlyMap).map(([m, revenue]) => ({ m, revenue }));

  // Recent activity from orders
  const recentActivity = orders.slice(0, 4).map(o => ({
    msg: `Commande ${o.code} — ${o.customer_name}`,
    time: new Date(o.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short" }),
    avatar: o.customer_name?.slice(0, 2).toUpperCase() || "??"
  }));

  const kpis = [
    { key: "new_products", value: totalProducts, delta: null, up: true, icon: Package },
    { key: "available_stock", value: totalStock, delta: null, up: true, icon: Package },
    { key: "new_orders", value: totalOrders, delta: null, up: true, icon: ShoppingCart },
    { key: "new_customers", value: totalCustomers, delta: null, up: true, icon: Users },
  ];

  if (loading) return (
    <div style={{ padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "#aaa" }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#F0F0F0" }}>
      <Header title={t("dashboard")} subtitle={t("welcome")} />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {kpis.map(({ key, value, up, icon: Icon }) => (
          <div key={key} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#888", fontSize: 12, margin: "0 0 6px" }}>{t(key)}</p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{value.toLocaleString()}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color="#555" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
              <DollarSign size={13} color="#aaa" />
              <span style={{ fontSize: 12, color: "#aaa" }}>{t("total_revenue")}: {fmt(totalRevenue)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Donut + Area */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>{t("profit_by_category")}</p>
          <p style={{ color: "#aaa", fontSize: 11, margin: "0 0 12px" }}>{t("annual_breakdown")}</p>
          {donutData.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PieChart width={160} height={160}>
                  <Pie data={donutData} cx={75} cy={75} innerRadius={48} outerRadius={75} dataKey="value" strokeWidth={2}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div style={{ textAlign: "center", marginTop: -4, marginBottom: 12 }}>
                <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fmt(categoryTotal)}</p>
                <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{t("total_revenue")}</p>
              </div>
              {donutData.map(d => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{d.value}%</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 13 }}>Aucun produit</div>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{t("order_summary")}</p>
              <p style={{ color: "#aaa", fontSize: 11, margin: "2px 0 0" }}>{t("full_year")}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fmt(totalRevenue)}</p>
              <span style={{ fontSize: 11, color: "#16a34a", background: "#DCFCE7", padding: "1px 6px", borderRadius: 4 }}>{t("delivered")}</span>
            </div>
          </div>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8F000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).split(" ")[0]} />
                <Tooltip formatter={(v) => [fmt(Number(v)), t("revenue")]} />
                <Area type="monotone" dataKey="revenue" stroke="#C8F000" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#aaa", fontSize: 13 }}>
              Aucune commande livrée pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Stock + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{t("stock_level")}</p>
            <span style={{ background: "#1C1C1C", color: "#C8F000", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{totalProducts} SKUs</span>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucun produit ajouté</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {[t("product"), t("sku"), t("qty"), t("status")].map(h => (
                    <th key={h} style={{ textAlign: "left", color: "#aaa", fontWeight: 500, padding: "0 0 8px", fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map(p => {
                  const st = statusStyles[p.status] || statusStyles.active;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F9F9F9" }}>
                      <td style={{ padding: "9px 0", fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: "9px 0", color: "#aaa" }}>{p.code}</td>
                      <td style={{ padding: "9px 0", fontWeight: 600 }}>{p.stock}</td>
                      <td style={{ padding: "9px 0" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(statusKeys[p.status] || "active")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 12, margin: "0 0 14px" }}>{t("recent_activity")}</p>
          {recentActivity.length === 0 ? (
            <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune activité</div>
          ) : (
            recentActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{a.avatar}</div>
                <div>
                  <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>{a.msg}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{a.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
