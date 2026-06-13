"use client";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Bell, Search, TrendingUp, TrendingDown, Package, ShoppingCart, Users } from "lucide-react";

const areaData = [
  { m: "Jan", revenue: 420000 }, { m: "Feb", revenue: 680000 }, { m: "Mar", revenue: 510000 },
  { m: "Apr", revenue: 890000 }, { m: "May", revenue: 750000 }, { m: "Jun", revenue: 920000 },
  { m: "Jul", revenue: 1100000 }, { m: "Aug", revenue: 980000 }, { m: "Sep", revenue: 860000 },
  { m: "Oct", revenue: 1000000 }, { m: "Nov", revenue: 1300000 }, { m: "Dec", revenue: 1600000 },
];

const donutData = [
  { name: "Electronics", value: 42, color: "#C8F000" },
  { name: "Accessories", value: 28, color: "#1C1C1C" },
  { name: "Networking", value: 18, color: "#E0E0E0" },
  { name: "Software", value: 12, color: "#999" },
];

const trafficData = [
  { label: "Direct", pct: 27, trend: [10,14,11,18,14,20,18], color: "#C8F000", up: true },
  { label: "Referral", pct: 23, trend: [8,12,10,15,12,11,14], color: "#C8F000", up: true },
  { label: "Organic", pct: 18, trend: [12,10,14,9,12,10,8], color: "#FF4D4D", up: false },
  { label: "Social", pct: 10, trend: [5,7,6,8,7,9,8], color: "#C8F000", up: true },
  { label: "Email", pct: 8, trend: [6,5,7,5,4,6,5], color: "#FF4D4D", up: false },
];

const stockItems = [
  { name: "ASUS ROG Gaming Laptop", sku: "LP-001-ROG", qty: 225, status: "low" },
  { name: "Logitech MX Keys", sku: "KB-044-LGT", qty: 12, status: "critical" },
  { name: "Samsung 27\" Monitor", sku: "MN-027-SAM", qty: 48, status: "ok" },
  { name: "TP-Link Router AX3000", sku: "RT-300-TPL", qty: 5, status: "critical" },
  { name: "Dell XPS 15 Laptop", sku: "LP-015-DEL", qty: 31, status: "low" },
];

const restocks = [
  { name: "Manage Employee Files", due: "Apr 10, 2025", tag: "HR", color: "#C8F000" },
  { name: "Quarterly Budget Review", due: "Apr 15, 2025", tag: "Finance", color: "#818cf8" },
  { name: "Server Infrastructure", due: "May 03, 2025", tag: "IT", color: "#FB923C" },
  { name: "Latest Client Campaign", due: "May 09, 2025", tag: "Marketing", color: "#34d399" },
  { name: "New UX/UI Redesign", due: "May 14, 2025", tag: "Design", color: "#60a5fa" },
];

const activity = [
  { msg: "Sarah confirmed delivery #ORD-4821", time: "2m ago", avatar: "SM" },
  { msg: "New order placed — TP-Link x5 units", time: "14m ago", avatar: "KA" },
  { msg: "Invoice #INV-2031 marked as paid", time: "1h ago", avatar: "AZ" },
  { msg: "Low stock alert: Logitech MX Keys", time: "2h ago", avatar: "SY" },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  ok: { bg: "#DCFCE7", color: "#16a34a", label: "Healthy" },
  low: { bg: "#FEF9C3", color: "#ca8a04", label: "Low" },
  critical: { bg: "#FEE2E2", color: "#dc2626", label: "Critical" },
};

export default function Dashboard() {
  const [search, setSearch] = useState("");

  const kpis = [
    { label: "New Products", value: "4,992", delta: "+12%", up: true, icon: Package },
    { label: "Available Stock", value: "2,137", delta: "-3%", up: false, icon: Package },
    { label: "New Orders", value: "1,952", delta: "+8%", up: true, icon: ShoppingCart },
    { label: "New Customers", value: "803", delta: "+5%", up: true, icon: Users },
  ];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#F0F0F0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>Welcome back, Admin ZAIMI 👋</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..."
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", width: 220 }} />
          </div>
          <div style={{ position: "relative" }}>
            <Bell size={18} color="#555" />
            <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#C8F000" }} />
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>AZ</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {kpis.map(({ label, value, delta, up, icon: Icon }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#888", fontSize: 12, margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color="#555" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
              {up ? <TrendingUp size={13} color="#16a34a" /> : <TrendingDown size={13} color="#dc2626" />}
              <span style={{ fontSize: 12, color: up ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{delta}</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>Profit by Category</p>
          <p style={{ color: "#aaa", fontSize: 11, margin: "0 0 12px" }}>Annual breakdown</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart width={160} height={160}>
              <Pie data={donutData} cx={75} cy={75} innerRadius={48} outerRadius={75} dataKey="value" strokeWidth={2}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div style={{ textAlign: "center", marginTop: -4, marginBottom: 12 }}>
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>$1,000,000</p>
            <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Total Revenue</p>
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
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Order Summary</p>
              <p style={{ color: "#aaa", fontSize: 11, margin: "2px 0 0" }}>Full year 2025</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>$8,870</p>
              <span style={{ fontSize: 11, color: "#16a34a", background: "#DCFCE7", padding: "1px 6px", borderRadius: 4 }}>+14.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8F000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8F000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`]} />
              <Area type="monotone" dataKey="revenue" stroke="#C8F000" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px 240px", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>Stock Level</p>
            <span style={{ background: "#1C1C1C", color: "#C8F000", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>225 SKUs</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                {["Product", "SKU", "Qty", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", color: "#aaa", fontWeight: 500, padding: "0 0 8px", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockItems.map(s => {
                const st = statusStyles[s.status];
                return (
                  <tr key={s.sku} style={{ borderBottom: "1px solid #F9F9F9" }}>
                    <td style={{ padding: "9px 0", fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: "9px 0", color: "#aaa" }}>{s.sku}</td>
                    <td style={{ padding: "9px 0", fontWeight: 600 }}>{s.qty}</td>
                    <td style={{ padding: "9px 0" }}>
                      <span style={{ background: st.bg, color: st.color, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>Upcoming Restocks</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {restocks.map(r => (
              <div key={r.name} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: "#F9F9F9" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500 }}>{r.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#aaa" }}>{r.due}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 8, background: r.color + "22", color: r.color }}>{r.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>Traffic Sources</p>
          <p style={{ color: "#aaa", fontSize: 11, margin: "0 0 14px" }}>Last 30 days</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trafficData.map(t => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>{t.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: "#F0F0F0", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${t.pct * 3.5}%`, background: t.color, borderRadius: 2 }} />
                  </div>
                </div>
                <MiniSparkline data={t.trend} color={t.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F0F0F0" }}>
            <p style={{ fontWeight: 600, fontSize: 12, margin: "0 0 10px" }}>Recent Activity</p>
            {activity.slice(0, 3).map(a => (
              <div key={a.msg} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{a.avatar}</div>
                <div>
                  <p style={{ fontSize: 11, margin: 0, lineHeight: 1.4 }}>{a.msg}</p>
                  <p style={{ fontSize: 10, color: "#aaa", margin: "1px 0 0" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
