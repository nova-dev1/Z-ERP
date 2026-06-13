"use client";
import { Bell, Search } from "lucide-react";
import { useApp, Lang, Currency } from "@/context/AppContext";
import { useState } from "react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t, lang, setLang, currency, setCurrency } = useApp();
  const [search, setSearch] = useState("");

  const langs: { code: Lang; label: string; flag: string }[] = [
    { code: "fr", label: "FR", flag: "🇫🇷" },
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "ar", label: "عر", flag: "🇩🇿" },
  ];

  const currencies: Currency[] = ["DZD", "USD", "EUR"];

  const btnStyle = (active: boolean) => ({
    padding: "5px 10px",
    borderRadius: 6,
    border: active ? "1.5px solid #C8F000" : "1.5px solid #E5E7EB",
    background: active ? "#C8F000" : "#fff",
    color: active ? "#1C1C1C" : "#555",
    fontWeight: active ? 700 : 400,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "#888", fontSize: 13, margin: "2px 0 0" }}>{subtitle}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")}
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", width: 200 }} />
        </div>

        {/* Language switcher */}
        <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 8, border: "1px solid #E5E7EB" }}>
          {langs.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={btnStyle(lang === l.code)}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        {/* Currency switcher */}
        <div style={{ display: "flex", gap: 4, background: "#fff", padding: 4, borderRadius: 8, border: "1px solid #E5E7EB" }}>
          {currencies.map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={btnStyle(currency === c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <Bell size={18} color="#555" />
          <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#C8F000" }} />
        </div>

        {/* Avatar */}
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>AZ</div>
      </div>
    </div>
  );
}
