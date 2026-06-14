"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function Finance() {
  const { t, fmt } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  const delivered = orders.filter(o => o.status === "delivered");
  const cancelled = orders.filter(o => o.status === "cancelled");
  const totalIncome = delivered.reduce((a, o) => a + (o.total_dzd || 0), 0);
  const totalExpenses = cancelled.reduce((a, o) => a + (o.total_dzd || 0), 0);
  const profit = totalIncome - totalExpenses;

  // Group by month
  const monthlyMap: Record<string, { income: number; expenses: number }> = {};
  orders.forEach(o => {
    const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
    if (!monthlyMap[m]) monthlyMap[m] = { income: 0, expenses: 0 };
    if (o.status === "delivered") monthlyMap[m].income += o.total_dzd || 0;
    if (o.status === "cancelled") monthlyMap[m].expenses += o.total_dzd || 0;
  });
  const monthly = Object.entries(monthlyMap).map(([m, v]) => ({ m, ...v }));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("finance_title")} subtitle={t("finance_sub")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { key: "total_revenue_card", value: totalIncome, color: "#16a34a", bg: "#DCFCE7" },
          { key: "total_expenses", value: totalExpenses, color: "#dc2626", bg: "#FEE2E2" },
          { key: "net_profit", value: profit, color: "#2563eb", bg: "#DBEAFE" },
        ].map(c => (
          <div key={c.key} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>{t(c.key)}</p>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: c.color }}>{fmt(c.value)}</p>
            <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 6, marginTop: 8, display: "inline-block" }}>{t("ytd")}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>{t("income_vs_expenses")}</p>
          {monthly.length === 0 ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barCategoryGap="30%">
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).split(" ")[0]} />
                <Tooltip formatter={(v) => [fmt(Number(v))]} />
                <Bar dataKey="income" fill="#C8F000" radius={[4,4,0,0]} name={t("total_revenue_card")} />
                <Bar dataKey="expenses" fill="#1C1C1C" radius={[4,4,0,0]} name={t("total_expenses")} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>{t("recent_transactions")}</p>
          {orders.length === 0 ? (
            <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune transaction</div>
          ) : (
            orders.slice(0, 7).map((o, i) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < Math.min(orders.length, 7) - 1 ? "1px solid #F5F5F5" : "none" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{o.code} — {o.customer_name}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{new Date(o.created_at).toLocaleDateString("fr-DZ")}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: o.status === "delivered" ? "#16a34a" : o.status === "cancelled" ? "#dc2626" : "#888", whiteSpace: "nowrap" }}>
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
