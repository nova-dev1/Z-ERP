"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function Finance() {
  const { t, fmt, darkMode } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const subCard = darkMode ? "#2A2A2A" : "#F9F9F9";

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

  // Total revenue = sum of delivered order totals
  const totalRevenue = delivered.reduce((a, o) => a + (o.total_dzd || 0), 0);

  // Net profit = revenue - cost price for each delivered order
  const totalCost = delivered.reduce((a, o) => {
    const prod = products.find(p =>
      p.name === o.product ||
      o.product?.toLowerCase().includes(p.name?.toLowerCase().split(" ")[0]) ||
      p.name?.toLowerCase().includes(o.product?.toLowerCase().split(" ")[0])
    );
    return a + (prod ? (prod.cost_price_dzd || 0) * (o.qty || 1) : 0);
  }, 0);
  const netProfit = totalRevenue - totalCost;
  const totalExpenses = orders.filter(o => o.status === "cancelled").reduce((a, o) => a + (o.total_dzd || 0), 0);

  // Rolling last 6 months
  const now = new Date();
  const monthlyMap: Record<string, { income: number; profit: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("fr-FR", { month: "short" });
    monthlyMap[key] = { income: 0, profit: 0 };
  }
  delivered.forEach(o => {
    const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
    if (!monthlyMap[m]) return;
    const prod = products.find(p =>
      p.name === o.product ||
      o.product?.toLowerCase().includes(p.name?.toLowerCase().split(" ")[0]) ||
      p.name?.toLowerCase().includes(o.product?.toLowerCase().split(" ")[0])
    );
    const cost = prod ? (prod.cost_price_dzd || 0) * (o.qty || 1) : 0;
    monthlyMap[m].income += o.total_dzd || 0;
    monthlyMap[m].profit += (o.total_dzd || 0) - cost;
  });
  const monthly = Object.entries(monthlyMap).map(([m, v]) => ({ m, ...v }));

  if (loading) return <div style={{ padding: "28px 32px", color: muted }}>Chargement...</div>;

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("finance_title")} subtitle={t("finance_sub")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { key: "total_revenue_card", value: totalRevenue, color: "#16a34a", bg: "#DCFCE7" },
          { key: "total_expenses", value: totalExpenses, color: "#dc2626", bg: "#FEE2E2" },
          { key: "net_profit", value: netProfit, color: "#2563eb", bg: "#DBEAFE" },
        ].map(c => (
          <div key={c.key} style={{ background: card, borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
            <p style={{ color: muted, fontSize: 12, margin: "0 0 8px" }}>{t(c.key)}</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: c.color }}>{fmt(c.value)}</p>
            <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 6, marginTop: 8, display: "inline-block" }}>{t("last_30_days")}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px", color: text }}>{t("income_vs_expenses")}</p>
          <p style={{ fontSize: 11, color: muted, margin: "0 0 16px" }}>{t("last_30_days")} — {t("revenue")} vs {t("net_profit")}</p>
          {monthly.every(m => m.income === 0) ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: muted, fontSize: 13 }}>Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barCategoryGap="30%">
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).split(" ")[0]} />
                <Tooltip formatter={(v) => [fmt(Number(v))]} contentStyle={{ background: card, border: `1px solid ${border}`, color: text }} />
                <Bar dataKey="income" fill="#C8F000" radius={[4,4,0,0]} name={t("total_revenue_card")} />
                <Bar dataKey="profit" fill="#2563eb" radius={[4,4,0,0]} name={t("net_profit")} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "background 0.2s" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px", color: text }}>{t("recent_transactions")}</p>
          {orders.length === 0 ? (
            <div style={{ color: muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune transaction</div>
          ) : (
            [...orders].reverse().slice(0, 8).map((o, i, arr) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : "none" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: text }}>{o.code} — {o.customer_name}</p>
                  <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{new Date(o.created_at).toLocaleDateString("fr-DZ")}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: o.status === "delivered" ? "#16a34a" : o.status === "cancelled" ? "#dc2626" : muted, whiteSpace: "nowrap" }}>
                  {o.status === "delivered" ? "+" : o.status === "cancelled" ? "-" : ""}{fmt(o.total_dzd)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
