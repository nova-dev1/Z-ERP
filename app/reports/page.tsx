"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function Reports() {
  const { t, fmt } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("*"),
    ]).then(([o, p]) => {
      setOrders(o.data || []);
      setProducts(p.data || []);
      setLoading(false);
    });
  }, []);

  // Monthly sales trend
  const monthlyMap: Record<string, number> = {};
  orders.filter(o => o.status === "delivered").forEach(o => {
    const m = new Date(o.created_at).toLocaleString("fr-FR", { month: "short" });
    monthlyMap[m] = (monthlyMap[m] || 0) + 1;
  });
  const salesData = Object.entries(monthlyMap).map(([m, sales]) => ({ m, sales }));

  // Top products by revenue (from orders)
  const productRevMap: Record<string, { units: number; revenue: number }> = {};
  orders.filter(o => o.status === "delivered").forEach(o => {
    if (!productRevMap[o.product]) productRevMap[o.product] = { units: 0, revenue: 0 };
    productRevMap[o.product].units += o.qty || 1;
    productRevMap[o.product].revenue += o.total_dzd || 0;
  });
  const topProducts = Object.entries(productRevMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const totalRevenue = topProducts.reduce((a, b) => a + b.revenue, 0) || 1;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("reports_title")}</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>{t("reports_sub")}</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1C1C1C", color: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Download size={14} /> {t("export_pdf")}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>{t("sales_trend")}</p>
          {salesData.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>Aucune vente livrée</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8F000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#C8F000" strokeWidth={2} fill="url(#sg)" name={t("units")} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>{t("units_sold")}</p>
          {topProducts.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>Aucune vente</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip />
                <Bar dataKey="units" fill="#C8F000" radius={[0,4,4,0]} name={t("units")} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>{t("top_products")}</p>
        {topProducts.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucune vente livrée pour le moment</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
                {[t("rank"), t("product"), t("units"), t("revenue"), t("share")].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => {
                const share = ((p.revenue / totalRevenue) * 100).toFixed(1);
                return (
                  <tr key={p.name} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#C8F000" : "#F0F0F0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: "12px 16px" }}>{p.units}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{fmt(p.revenue)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 4, width: 80, background: "#F0F0F0", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${share}%`, background: "#C8F000", borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{share}%</span>
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
