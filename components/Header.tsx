"use client";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useApp, Lang, Currency } from "@/context/AppContext";
import { useState } from "react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t, lang, setLang, currency, setCurrency, darkMode, toggleDark } = useApp();
  const [search, setSearch] = useState("");

  const card = darkMode ? "#1C1C1C" : "#fff";
  const border = darkMode ? "#3A3A3A" : "#E5E7EB";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#888" : "#aaa";

  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "ar", flag: "🇩🇿", label: "عر" },
  ];

  const btnStyle = (active: boolean) => ({
    padding: "5px 10px", borderRadius: 6,
    border: active ? "1.5px solid #C8F000" : `1.5px solid ${border}`,
    background: active ? "#C8F000" : card,
    color: active ? "#1C1C1C" : text,
    fontWeight: active ? 700 : 400,
    fontSize: 12, cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: text }}>{title}</h1>
        {subtitle && <p style={{ color: muted, fontSize: 13, margin: "2px 0 0" }}>{subtitle}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")}
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, outline: "none", background: card, color: text, width: 180 }} />
        </div>

        {/* Language */}
        <div style={{ display: "flex", gap: 3, background: card, padding: 4, borderRadius: 8, border: `1px solid ${border}` }}>
          {langs.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={btnStyle(lang === l.code)}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        {/* Currency */}
        <div style={{ display: "flex", gap: 3, background: card, padding: 4, borderRadius: 8, border: `1px solid ${border}` }}>
          {(["DZD", "USD", "EUR"] as Currency[]).map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={btnStyle(currency === c)}>{c}</button>
          ))}
        </div>

        {/* Dark mode toggle */}
        <button onClick={toggleDark} style={{
          width: 36, height: 36, borderRadius: 8, border: `1px solid ${border}`,
          background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
        }}>
          {darkMode ? <Sun size={16} color="#C8F000" /> : <Moon size={16} color="#555" />}
        </button>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <Bell size={18} color={muted} />
          <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: "#C8F000" }} />
        </div>

        {/* Avatar */}
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#C8F000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1C1C1C" }}>AZ</div>
      </div>
    </div>
  );
}
