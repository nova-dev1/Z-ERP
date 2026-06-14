"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" },
  out: { bg: "#F3F4F6", color: "#6b7280" },
};
const statusKeys: Record<string, string> = { active: "active", low: "low", critical: "critical", out: "inactive" };
const DONUT_COLORS = ["#C8F000", "#818cf8", "#FB923C", "#34d399", "#60a5fa", "#f472b6"];

export default function Dashboard() {
  const { t, fmt, darkMode } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme colors
  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#888" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F0F0F0";
  const subBg = darkMode ? "#2A2A2A" : "#F9F9F9";

  useEffect(() => {
    const load = async () => {
      const [p, o, c] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("customers").select("*"),
      ]);
      setProducts(p.data || []);
      setOrders(o.data || []);
      setCustomers(c.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const totalOrders = orders.length;
  const activeVipClients = customers.filter(c => c.status === "active" || c.status === "vip").length;

  // Real profit from delivered orders: need to match product cost price
  // Group profit by category from delivered orders
  const categoryProfitMap: Record<string, number> = {};
  deliveredOrders.forEach(o => {
    // Find matching product
    const prod = products.find(p => p.name === o.product || o.product?.includes(p.name?.split(" ")[0]));
    const sellPrice = o.total_dzd || 0;
    const costPrice = prod ? (prod.cost_price_dzd || 0) * (o.qty || 1) : 0;
    const profit = sellPrice - costPrice;
    const category = prod?.category || "Autre";
    categoryProfitMap[category] = (categoryProfitMap[category] || 0) + profit;
  });

  const totalProfit = Object.values(categoryProfitMap).reduce((a, b) => a + b, 0);
  const donutData = Object.entries(categoryProfitMap)
    .filter(([, v]) => v > 0)
    .map(([name, value], i) => ({
      name, value: Math.round((value / (totalProfit || 1)) * 100), color: DONUT_COLORS[i % DONUT_COLORS.length]
    }));

  // Monthly revenue from delivered orders
  const monthlyMap: Record<string, number> = {};
  deliveredOrders.forEach(o => {
    const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
    monthlyMap[m] = (monthlyMap[m] || 0) + (o.total_dzd || 0);
  });
  const areaData = Object.entries(monthlyMap).map(([m, revenue]) => ({ m, revenue }));

  // Recent activity
  const recentActivity = orders.slice(0, 4).map(o => ({
    msg: `${o.code} — ${o.customer_name}`,
    time: new Date(o.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short" }),
    avatar: o.customer_name?.slice(0, 2).toUpperCase() || "??",
    status: o.status,
  }));

  const kpis = [
    { key: "new_products", value: products.length, icon: Package, sub: `${t("available_stock")}: ${totalStock}` },
    { key: "new_orders", value: totalOrders, icon: ShoppingCart, sub: `${deliveredOrders.length} ${t("delivered")}` },
    { key: "new_customers", value: activeVipClients, icon: Users, sub: `${t("active")} & VIP` },
    { key: "net_profit", value: fmt(totalProfit), icon: TrendingUp, sub: t("delivered"), isAmount: true },
  ];

  if (loading) return (
    <div style={{ padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: muted }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh" }}>
      <Header title={t("dashboard")} subtitle={t("welcome")} />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {kpis.map(({ key, value, icon: Icon, sub, isAmount }) => (
          <div key={key} style={{ background: card, borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: muted, fontSize: 12, margin: "0 0 6px" }}>{t(key)}</p>
                <p style={{ fontSize: isAmount ? 20 : 28, fontWeight: 700, margin: 0, color: text }}>{value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: darkMode ? "#2A2A2A" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={muted} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: muted, margin: "10px 0 0" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Donut + Area */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: text }}>{t("profit_by_category")}</p>
          <p style={{ color: muted, fontSize: 11, margin: "0 0 12px" }}>Bénéfice réel — commandes livrées</p>
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
                <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#16a34a" }}>{fmt(totalProfit)}</p>
                <p style={{ fontSize: 11, color: muted, margin: 0 }}>{t("total_profit")}</p>
              </div>
              {donutData.map(d => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ fontSize: 12, color: text }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: text }}>{d.value}%</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: muted, fontSize: 12 }}>
              Aucune vente livrée<br/>Le profit apparaît après chaque livraison
            </div>
          )}
        </div>

        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: text }}>{t("order_summary")}</p>
              <p style={{ color: muted, fontSize: 11, margin: "2px 0 0" }}>Commandes livrées seulement</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: text }}>{fmt(deliveredOrders.reduce((a, o) => a + (o.total_dzd || 0), 0))}</p>
              <span style={{ fontSize: 11, color: "#16a34a", background: "#DCFCE7", padding: "1px 6px", borderRadius: 4 }}>{deliveredOrders.length} {t("delivered")}</span>
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
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).split(" ")[0]} />
                <Tooltip formatter={(v) => [fmt(Number(v)), t("revenue")]} contentStyle={{ background: card, border: `1px solid ${border}`, color: text }} />
                <Area type="monotone" dataKey="revenue" stroke="#C8F000" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: muted, fontSize: 13 }}>
              Aucune commande livrée pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Stock + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: text }}>{t("stock_level")}</p>
            <span style={{ background: "#1C1C1C", color: "#C8F000", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{products.length} SKUs</span>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: muted, fontSize: 13 }}>Aucun produit ajouté</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {[t("product"), t("sku"), t("qty"), t("profit"), t("status")].map(h => (
                    <th key={h} style={{ textAlign: "left", color: muted, fontWeight: 500, padding: "0 0 8px", fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map(p => {
                  const st = statusStyles[p.status] || statusStyles.active;
                  const profit = (p.price_dzd || 0) - (p.cost_price_dzd || 0);
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "9px 0", fontWeight: 500, color: text }}>{p.name}</td>
                      <td style={{ padding: "9px 0", color: muted }}>{p.code}</td>
                      <td style={{ padding: "9px 0", fontWeight: 600, color: text }}>{p.stock}</td>
                      <td style={{ padding: "9px 0", color: profit > 0 ? "#16a34a" : muted, fontWeight: 600 }}>{fmt(profit)}</td>
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

        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 12, margin: "0 0 14px", color: text }}>{t("recent_activity")}</p>
          {recentActivity.length === 0 ? (
            <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune activité</div>
          ) : recentActivity.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, color: "#1C1C1C" }}>{a.avatar}</div>
              <div>
                <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4, color: text }}>{a.msg}</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                  <p style={{ fontSize: 11, color: muted, margin: 0 }}>{a.time}</p>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 6, background: a.status === "delivered" ? "#DCFCE7" : a.status === "cancelled" ? "#FEE2E2" : "#DBEAFE", color: a.status === "delivered" ? "#16a34a" : a.status === "cancelled" ? "#dc2626" : "#2563eb" }}>{t(a.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
