"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function Reports() {
  const { t, fmt, darkMode } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";

  useEffect(() => {
    const load = async () => {
      const [o, p] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: true }),
        supabase.from("products").select("*"),
      ]);
      setOrders(o.data || []);
      setProducts(p.data || []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const delivered = orders.filter(o => o.status === "delivered");

  // Rolling last 6 months sales trend
  const now = new Date();
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[d.toLocaleString("fr-FR", { month: "short" })] = 0;
  }
  delivered.forEach(o => {
    const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
    if (monthlyMap[m] !== undefined) monthlyMap[m]++;
  });
  const salesData = Object.entries(monthlyMap).map(([m, sales]) => ({ m, sales }));

  // Top products by revenue
  const productRevMap: Record<string, { units: number; revenue: number; profit: number }> = {};
  delivered.forEach(o => {
    const prod = products.find(p =>
      p.name === o.product ||
      o.product?.toLowerCase().includes(p.name?.toLowerCase().split(" ")[0]) ||
      p.name?.toLowerCase().includes(o.product?.toLowerCase().split(" ")[0])
    );
    const key = o.product;
    if (!productRevMap[key]) productRevMap[key] = { units: 0, revenue: 0, profit: 0 };
    const cost = prod ? (prod.cost_price_dzd || 0) * (o.qty || 1) : 0;
    productRevMap[key].units += o.qty || 1;
    productRevMap[key].revenue += o.total_dzd || 0;
    productRevMap[key].profit += (o.total_dzd || 0) - cost;
  });
  const topProducts = Object.entries(productRevMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const totalRevenue = topProducts.reduce((a, b) => a + b.revenue, 0) || 1;

  if (loading) return <div style={{ padding: "28px 32px", color: muted }}>Chargement...</div>;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: text }}>{t("reports_title")}</h1>
          <p style={{ color: muted, fontSize: 13, margin: "2px 0 0" }}>{t("reports_sub")}</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1C1C1C", color: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Download size={14} /> {t("export_pdf")}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: text }}>{t("sales_trend")}</p>
          <p style={{ fontSize: 11, color: muted, margin: "0 0 16px" }}>{t("last_30_days")} — 6 mois</p>
          {salesData.every(s => s.sales === 0) ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: 13 }}>Aucune vente livrée</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8F000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, color: text }} />
                <Area type="monotone" dataKey="sales" stroke="#C8F000" strokeWidth={2} fill="url(#sg)" name={t("units")} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: text }}>{t("units_sold")}</p>
          <p style={{ fontSize: 11, color: muted, margin: "0 0 16px" }}>{t("delivered")}</p>
          {topProducts.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: 13 }}>Aucune vente</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: text }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, color: text }} />
                <Bar dataKey="units" fill="#C8F000" radius={[0,4,4,0]} name={t("units")} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px", color: text }}>{t("top_products")}</p>
        {topProducts.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: muted, fontSize: 13 }}>Aucune vente livrée pour le moment</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                {[t("rank"), t("product"), t("units"), t("revenue"), t("net_profit"), t("share")].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: muted, fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => {
                const share = ((p.revenue / totalRevenue) * 100).toFixed(1);
                return (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#C8F000" : darkMode ? "#2A2A2A" : "#F0F0F0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i === 0 ? "#1C1C1C" : text }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: text }}>{p.name}</td>
                    <td style={{ padding: "12px 16px", color: text }}>{p.units}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: text }}>{fmt(p.revenue)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#16a34a" }}>{fmt(p.profit)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 4, width: 80, background: darkMode ? "#2A2A2A" : "#F0F0F0", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${share}%`, background: "#C8F000", borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, color: text }}>{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
