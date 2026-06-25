"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, X, Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { exportToExcel } from "@/lib/exportExcel";
import * as XLSX from "xlsx";

type Product = { id: string; code: string; name: string; category: string; price_dzd: number; cost_price_dzd: number; stock: number; status: string; };

const statusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" }, low: { bg: "#FEF9C3", color: "#ca8a04" },
  critical: { bg: "#FEE2E2", color: "#dc2626" }, out: { bg: "#F3F4F6", color: "#6b7280" },
};
const statusKeys: Record<string, string> = { active: "active", low: "low", critical: "critical", out: "inactive" };
const emptyForm = { code: "", name: "", category: "", price_dzd: 0, cost_price_dzd: 0, stock: 0, status: "active" };

export default function Products() {
  const { t, fmt, darkMode } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"select" | "new">("select");
  const [filterCategory, setFilterCategory] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatus = (qty: number) => {
    if (qty === 0) return "out";
    if (qty <= 3) return "critical";
    if (qty <= 5) return "low";
    return "active";
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { range: 3, header: ["name", "category", "cost_price_dzd", "price_dzd", "stock"] });

      const valid = rows.filter(r => r.name && r.category && r.price_dzd);
      const errors: string[] = [];
      let success = 0;

      for (let i = 0; i < valid.length; i++) {
        const r = valid[i];
        const qty = Number(r.stock) || 0;
        const code = `PRD-${new Date().getFullYear()}-${String(products.length + i + 1).padStart(3, "0")}`;
        const { error } = await supabase.from("products").insert({
          code,
          name: String(r.name).trim(),
          category: String(r.category).trim(),
          cost_price_dzd: Number(r.cost_price_dzd) || 0,
          price_dzd: Number(r.price_dzd) || 0,
          stock: qty,
          status: getStatus(qty),
        });
        if (error) errors.push(`Ligne ${i + 4}: ${r.name} — ${error.message}`);
        else success++;
      }

      setImportResult({ success, errors });
      load();
    } catch (err) {
      setImportResult({ success: 0, errors: ["Fichier invalide. Utilisez le modèle Z-ERP."] });
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const card = darkMode ? "#1C1C1C" : "#fff";
  const border = darkMode ? "#2A2A2A" : "#F0F0F0";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#888" : "#aaa";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: darkMode ? "#2A2A2A" : "#fff", color: text };

  const load = async () => { setLoading(true); const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }); setProducts(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);

  // Existing categories, deduplicated
  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  const generateCode = () => {
    const year = new Date().getFullYear();
    const num = String(products.length + 1).padStart(3, "0");
    return `PRD-${year}-${num}`;
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setCategoryMode(existingCategories.length > 0 ? "select" : "new");
    setModal(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ code: p.code, name: p.name, category: p.category, price_dzd: p.price_dzd, cost_price_dzd: p.cost_price_dzd || 0, stock: p.stock, status: p.status });
    setCategoryMode("select");
    setModal(true);
  };
  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("products").update(form).eq("id", editing.id);
    } else {
      await supabase.from("products").insert({ ...form, code: generateCode() });
    }
    setSaving(false); setModal(false); load();
  };
  const del = async (id: string) => { if (!confirm("Supprimer ?")) return; await supabase.from("products").delete().eq("id", id); load(); };

  const handleExcel = () => exportToExcel(products, [
    { key: "code", label: "Code" }, { key: "name", label: "Nom" }, { key: "category", label: "Catégorie" },
    { key: "cost_price_dzd", label: "Prix Achat (DZD)" }, { key: "price_dzd", label: "Prix Vente (DZD)" },
    { key: "stock", label: "Stock" }, { key: "status", label: "Statut" },
  ], "Produits-ETS-ZAIMI");

  const filtered = products
    .filter(p => filterCategory === "all" || p.category === filterCategory)
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("products")} subtitle={`${products.length} ${t("total_products")}`} />

      {/* Category filter pills */}
      {existingCategories.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setFilterCategory("all")} style={{
            padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filterCategory === "all" ? "#C8F000" : darkMode ? "#3A3A3A" : "#E5E7EB"}`,
            background: filterCategory === "all" ? "#C8F000" : card, color: filterCategory === "all" ? "#1C1C1C" : muted,
            fontSize: 12, fontWeight: filterCategory === "all" ? 700 : 400, cursor: "pointer"
          }}>Toutes</button>
          {existingCategories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${filterCategory === cat ? "#C8F000" : darkMode ? "#3A3A3A" : "#E5E7EB"}`,
              background: filterCategory === cat ? "#C8F000" : card, color: filterCategory === cat ? "#1C1C1C" : muted,
              fontSize: 12, fontWeight: filterCategory === cat ? 700 : 400, cursor: "pointer"
            }}>{cat}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: card, color: text }} />
        </div>
        <button onClick={handleExcel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>
          <Download size={14} /> Excel
        </button>
        <button onClick={() => fileInputRef.current?.click()} disabled={importing}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: darkMode ? "#2A2A2A" : "#F0FFF4", color: "#16a34a", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          <Upload size={14} /> {importing ? "Import..." : "Importer Excel"}
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: "none" }} />
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
          <Plus size={14} /> {t("add_product")}
        </button>
      </div>

      {importResult && (
        <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 10, background: importResult.errors.length === 0 ? "#F0FFF4" : "#FFF7ED", border: `1px solid ${importResult.errors.length === 0 ? "#16a34a" : "#f97316"}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: importResult.errors.length > 0 ? 8 : 0 }}>
            {importResult.errors.length === 0
              ? <CheckCircle size={16} color="#16a34a" />
              : <AlertCircle size={16} color="#f97316" />}
            <span style={{ fontSize: 13, fontWeight: 600, color: importResult.errors.length === 0 ? "#16a34a" : "#f97316" }}>
              {importResult.success} produit(s) importé(s) avec succès
              {importResult.errors.length > 0 && ` — ${importResult.errors.length} erreur(s)`}
            </span>
            <button onClick={() => setImportResult(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><X size={14} /></button>
          </div>
          {importResult.errors.map((e, i) => (
            <p key={i} style={{ fontSize: 11, color: "#dc2626", margin: "2px 0" }}>• {e}</p>
          ))}
        </div>
      )}

      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
              <thead>
                <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                  {["Code", t("product"), "Catégorie", t("cost_price"), t("sell_price"), t("profit"), t("qty"), t("status"), ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: muted }}>Aucun produit</td></tr>
                ) : filtered.map(p => {
                  const st = statusStyle[p.status] || statusStyle.active;
                  const profit = (p.price_dzd || 0) - (p.cost_price_dzd || 0);
                  const margin = p.price_dzd ? ((profit / p.price_dzd) * 100).toFixed(1) : "0";
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "13px 16px", color: muted, fontSize: 12, whiteSpace: "nowrap" }}>{p.code}</td>
                      <td style={{ padding: "13px 16px", fontWeight: 500, color: text }}>{p.name}</td>
                      <td style={{ padding: "13px 16px", color: muted }}>{p.category}</td>
                      <td style={{ padding: "13px 16px", color: muted, whiteSpace: "nowrap" }}>{fmt(p.cost_price_dzd || 0)}</td>
                      <td style={{ padding: "13px 16px", fontWeight: 600, color: text, whiteSpace: "nowrap" }}>{fmt(p.price_dzd)}</td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ color: profit >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{fmt(profit)}</span>
                        <span style={{ color: muted, fontSize: 11, marginLeft: 4 }}>({margin}%)</span>
                      </td>
                      <td style={{ padding: "13px 16px", color: text }}>{p.stock}</td>
                      <td style={{ padding: "13px 16px" }}><span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{t(statusKeys[p.status] || "active")}</span></td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                          <button onClick={() => del(p.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
          onClick={() => setModal(false)}>
          <div style={{ background: card, borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text }}>{editing ? t("edit") : t("add_product")}</h2>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
            </div>

            {!editing && (
              <p style={{ fontSize: 12, color: muted, margin: "0 0 16px", padding: "8px 12px", background: darkMode ? "#2A2A2A" : "#F9F9F9", borderRadius: 8 }}>
                Code auto-généré: <strong style={{ color: text }}>{generateCode()}</strong>
              </p>
            )}
            {editing && (
              <p style={{ fontSize: 12, color: muted, margin: "0 0 16px" }}>Code: <strong style={{ color: text }}>{editing.code}</strong></p>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("product")}</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            {/* CATEGORY — smart dropdown */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>Catégorie</label>
              {categoryMode === "select" && existingCategories.length > 0 ? (
                <>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option value="">— Choisir une catégorie —</option>
                    {existingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <button onClick={() => { setCategoryMode("new"); setForm({ ...form, category: "" }); }}
                    style={{ marginTop: 6, fontSize: 11, color: "#C8F000", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                    + Créer une nouvelle catégorie
                  </button>
                </>
              ) : (
                <>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex: Caméras, Routeurs, Câblage..." style={inputStyle} />
                  {existingCategories.length > 0 && (
                    <button onClick={() => setCategoryMode("select")}
                      style={{ marginTop: 6, fontSize: 11, color: muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      ← Choisir une catégorie existante
                    </button>
                  )}
                </>
              )}
            </div>

            {([
              [t("cost_price"), "cost_price_dzd", "number"],
              [t("sell_price"), "price_dzd", "number"],
              [t("qty"), "stock", "number"],
            ] as [string, string, string][]).map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
                {(key === "price_dzd" || key === "cost_price_dzd") && form.price_dzd > 0 && form.cost_price_dzd > 0 && (
                  <p style={{ fontSize: 11, color: form.price_dzd > form.cost_price_dzd ? "#16a34a" : "#dc2626", margin: "4px 0 0" }}>
                    {t("profit")}: {fmt(form.price_dzd - form.cost_price_dzd)} ({(((form.price_dzd - form.cost_price_dzd) / form.price_dzd) * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 4 }}>{t("status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                {["active", "low", "critical", "out"].map(s => <option key={s} value={s}>{t(statusKeys[s])}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${darkMode ? "#3A3A3A" : "#E5E7EB"}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: "10px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#1C1C1C" }}>{saving ? "..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
