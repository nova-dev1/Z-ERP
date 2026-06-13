"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";

const monthly = [
  { m: "Jan", income: 5670000, expenses: 3780000 },
  { m: "Fév", income: 9180000, expenses: 4185000 },
  { m: "Mar", income: 6885000, expenses: 3645000 },
  { m: "Avr", income: 12015000, expenses: 5670000 },
  { m: "Mai", income: 10125000, expenses: 5130000 },
  { m: "Jun", income: 12420000, expenses: 5940000 },
];

const transactions = [
  { desc: "Facture #FAC-2031 — Karim A.", type: "income", amountDZD: 1332450, date: "13 Jun" },
  { desc: "Fournisseur — Pièces ASUS", type: "expense", amountDZD: 1674000, date: "12 Jun" },
  { desc: "Facture #FAC-2030 — Mourad B.", type: "income", amountDZD: 175365, date: "12 Jun" },
  { desc: "Loyer — Bureau Sétif", type: "expense", amountDZD: 472500, date: "10 Jun" },
  { desc: "Facture #FAC-2029 — Yasmine K.", type: "income", amountDZD: 121230, date: "09 Jun" },
  { desc: "Charges & Internet", type: "expense", amountDZD: 105300, date: "08 Jun" },
];

export default function Finance() {
  const { t, fmt } = useApp();

  const totalIncome = monthly.reduce((a, b) => a + b.income, 0);
  const totalExpenses = monthly.reduce((a, b) => a + b.expenses, 0);
  const profit = totalIncome - totalExpenses;

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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barCategoryGap="30%">
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).split(" ")[0]} />
              <Tooltip formatter={(v) => [fmt(Number(v))]} />
              <Bar dataKey="income" fill="#C8F000" radius={[4,4,0,0]} name={t("total_revenue_card")} />
              <Bar dataKey="expenses" fill="#1C1C1C" radius={[4,4,0,0]} name={t("total_expenses")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 14px" }}>{t("recent_transactions")}</p>
          {transactions.map((tr, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < transactions.length - 1 ? "1px solid #F5F5F5" : "none" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{tr.desc}</p>
                <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{tr.date}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: tr.type === "income" ? "#16a34a" : "#dc2626", whiteSpace: "nowrap" }}>
                {tr.type === "income" ? "+" : "-"}{fmt(tr.amountDZD)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
