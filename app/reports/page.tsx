"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";

const salesData = [
  { m: "Jan", sales: 42 }, { m: "Feb", sales: 68 }, { m: "Mar", sales: 51 },
  { m: "Apr", sales: 89 }, { m: "May", sales: 75 }, { m: "Jun", sales: 92 },
];

const topProducts = [
  { name: "ASUS ROG Laptop", units: 48, revenue: 62352 },
  { name: "Dell XPS 15", units: 31, revenue: 55769 },
  { name: "Samsung Monitor", units: 74, revenue: 33226 },
  { name: "TP-Link Router", units: 110, revenue: 9790 },
  { name: "Logitech MX Keys", units: 56, revenue: 6104 },
];

export default function Reports() {
  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reports</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>Business intelligence & analytics</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1C1C1C", color: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Download size={14} /> Export PDF
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>Sales Trend — H1 2025</p>
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
              <Area type="monotone" dataKey="sales" stroke="#C8F000" strokeWidth={2} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>Units Sold by Product</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip />
              <Bar dataKey="units" fill="#C8F000" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>Top Products by Revenue</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
              {["Rank", "Product", "Units Sold", "Revenue", "Share"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#888", fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => {
              const total = topProducts.reduce((a, b) => a + b.revenue, 0);
              const share = ((p.revenue / total) * 100).toFixed(1);
              return (
                <tr key={p.name} style={{ borderBottom: "1px solid #F5F5F5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#C8F000" : "#F0F0F0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "12px 16px" }}>{p.units}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>${p.revenue.toLocaleString()}</td>
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
      </div>
    </div>
  );
}
