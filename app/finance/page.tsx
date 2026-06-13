"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthly = [
  { m: "Jan", income: 42000, expenses: 28000 },
  { m: "Feb", income: 68000, expenses: 31000 },
  { m: "Mar", income: 51000, expenses: 27000 },
  { m: "Apr", income: 89000, expenses: 42000 },
  { m: "May", income: 75000, expenses: 38000 },
  { m: "Jun", income: 92000, expenses: 44000 },
];

const transactions = [
  { desc: "Invoice #INV-2031 — Karim A.", type: "income", amount: 9870, date: "Jun 13" },
  { desc: "Supplier Payment — ASUS Parts", type: "expense", amount: 12400, date: "Jun 12" },
  { desc: "Invoice #INV-2030 — Mourad B.", type: "income", amount: 1299, date: "Jun 12" },
  { desc: "Rent — Office Sétif", type: "expense", amount: 3500, date: "Jun 10" },
  { desc: "Invoice #INV-2029 — Yasmine K.", type: "income", amount: 898, date: "Jun 09" },
  { desc: "Utilities & Internet", type: "expense", amount: 780, date: "Jun 08" },
];

export default function Finance() {
  const totalIncome = monthly.reduce((a, b) => a + b.income, 0);
  const totalExpenses = monthly.reduce((a, b) => a + b.expenses, 0);
  const profit = totalIncome - totalExpenses;

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Finance</h1>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px" }}>Financial overview — 2025</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Revenue", value: `$${totalIncome.toLocaleString()}`, color: "#16a34a", bg: "#DCFCE7" },
          { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, color: "#dc2626", bg: "#FEE2E2" },
          { label: "Net Profit", value: `$${profit.toLocaleString()}`, color: "#2563eb", bg: "#DBEAFE" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <p style={{ color: "#888", fontSize: 12, margin: "0 0 8px" }}>{c.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: c.color }}>{c.value}</p>
            <span style={{ fontSize: 11, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 6, marginTop: 8, display: "inline-block" }}>YTD 2025</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 16px" }}>Income vs Expenses</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barCategoryGap="30%">
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip />
              <Bar dataKey="income" fill="#C8F000" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" fill="#1C1C1C" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>Recent Transactions</p>
          {transactions.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < transactions.length - 1 ? "1px solid #F5F5F5" : "none" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{t.desc}</p>
                <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{t.date}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.type === "income" ? "#16a34a" : "#dc2626" }}>
                {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
