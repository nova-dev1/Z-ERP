"use client";
import { useState, useEffect } from "react";
import { Search, Plus, X, Download, FileText, User, Package, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { generateInvoicePDF } from "@/lib/generateInvoice";
import { exportToExcel } from "@/lib/exportExcel";

type Order = { id: string; code: string; customer_name: string; customer_id_ref?: string; product: string; qty: number; total_dzd: number; status: string; created_at: string; };
type Product = { id: string; name: string; category: string; price_dzd: number; stock: number; status: string; };
type Customer = { id: string; code: string; name: string; email: string; phone: string; status: string; };

const statusStyle: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "#DCFCE7", color: "#16a34a" },
  processing: { bg: "#DBEAFE", color: "#2563eb" },
  pending: { bg: "#FEF9C3", color: "#ca8a04" },
  cancelled: { bg: "#FEE2E2", color: "#dc2626" },
};

const clientStatusStyle: Record<string, { bg: string; color: string }> = {
  active: { bg: "#DCFCE7", color: "#16a34a" },
  vip: { bg: "#F3E8FF", color: "#9333ea" },
  new: { bg: "#DBEAFE", color: "#2563eb" },
  inactive: { bg: "#F3F4F6", color: "#6b7280" },
};

export default function Orders() {
  const { t, fmt, darkMode } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("pending");
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const card = darkMode ? "#1C1C1C" : "#fff";
  const text = darkMode ? "#F0F0F0" : "#1A1A1A";
  const muted = darkMode ? "#777" : "#888";
  const border = darkMode ? "#2A2A2A" : "#F5F5F5";
  const headerBg = darkMode ? "#2A2A2A" : "#F9F9F9";
  const inputBg = darkMode ? "#2A2A2A" : "#fff";
  const inputBorder = darkMode ? "#3A3A3A" : "#E5E7EB";
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${inputBorder}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: inputBg, color: text };

  const load = async () => {
    setLoading(true);
    const [o, p, c] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").neq("status", "out").order("name"),
      supabase.from("customers").select("*").order("name"),
    ]);
    setOrders(o.data || []);
    setProducts(p.data || []);
    setCustomers(c.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-generate order code
  const generateCode = () => {
    const year = new Date().getFullYear();
    const num = String(orders.length + 1).padStart(3, "0");
    return `#ORD-${year}-${num}`;
  };

  const openAdd = () => {
    setEditing(null);
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setQty(1);
    setStatus("pending");
    setIsNewClient(false);
    setNewClient({ name: "", email: "", phone: "" });
    setClientSearch("");
    setProductSearch("");
    setModal(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setQty(o.qty);
    setStatus(o.status);
    setClientSearch(o.customer_name);
    setProductSearch(o.product);
    const prod = products.find(p => p.name === o.product);
    setSelectedProduct(prod || null);
    const cust = customers.find(c => c.id === o.customer_id_ref);
    setSelectedCustomer(cust || null);
    setIsNewClient(false);
    setModal(true);
  };

  const totalPrice = selectedProduct ? selectedProduct.price_dzd * qty : 0;

  const save = async () => {
    if (!selectedProduct && !editing) return;
    setSaving(true);

    try {
      let customerId = selectedCustomer?.id || null;
      let customerName = selectedCustomer?.name || editing?.customer_name || "";

      // Create new client if needed
      if (isNewClient && newClient.name) {
        const clientCode = `C-${String(customers.length + 1).padStart(3, "0")}`;
        const { data: newCust } = await supabase.from("customers").insert({
          code: clientCode,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          status: "new",
        }).select().single();
        if (newCust) {
          customerId = newCust.id;
          customerName = newCust.name;
        }
      }

      const orderData = {
        customer_name: customerName,
        customer_id_ref: customerId,
        product: selectedProduct?.name || editing?.product || "",
        qty,
        total_dzd: selectedProduct ? selectedProduct.price_dzd * qty : editing?.total_dzd || 0,
        status,
      };

      if (editing) {
        await supabase.from("orders").update(orderData).eq("id", editing.id);
      } else {
        await supabase.from("orders").insert({
          ...orderData,
          code: generateCode(),
        });
      }

      setSaving(false);
      setModal(false);
      load();
    } catch (e) {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    await supabase.from("orders").delete().eq("id", id);
    load();
  };

  const handleExcel = () => exportToExcel(orders, [
    { key: "code", label: "N° Commande" },
    { key: "customer_name", label: "Client" },
    { key: "product", label: "Produit" },
    { key: "qty", label: "Quantité" },
    { key: "total_dzd", label: "Total (DZD)" },
    { key: "status", label: "Statut" },
    { key: "created_at", label: "Date" },
  ], "Commandes-ETS-ZAIMI");

  const filtered = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(q.toLowerCase()) ||
    o.code?.toLowerCase().includes(q.toLowerCase())
  );

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px" }}>
      <Header title={t("orders")} subtitle={t("manage_orders")} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")}
            style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `1px solid ${inputBorder}`, borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: card, color: text }} />
        </div>
        <button onClick={handleExcel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px solid ${inputBorder}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>
          <Download size={14} /> Excel
        </button>
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1C1C1C" }}>
          <Plus size={14} /> {t("new_order")}
        </button>
      </div>

      <div style={{ background: card, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: muted }}>Chargement...</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                  {[t("order_id"), t("customer"), t("product"), t("qty"), t("total"), t("date"), t("status"), ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: muted, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: muted }}>Aucune commande</td></tr>
                ) : filtered.map(o => {
                  const st = statusStyle[o.status] || statusStyle.pending;
                  return (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "13px 16px", fontWeight: 700, color: "#C8F000", background: "#1C1C1C", fontSize: 12, whiteSpace: "nowrap" }}>{o.code}</td>
                      <td style={{ padding: "13px 16px", color: text, fontWeight: 500 }}>{o.customer_name}</td>
                      <td style={{ padding: "13px 16px", color: muted }}>{o.product}</td>
                      <td style={{ padding: "13px 16px", color: text }}>{o.qty}</td>
                      <td style={{ padding: "13px 16px", fontWeight: 600, color: text, whiteSpace: "nowrap" }}>{fmt(o.total_dzd)}</td>
                      <td style={{ padding: "13px 16px", color: muted, fontSize: 12, whiteSpace: "nowrap" }}>{new Date(o.created_at).toLocaleDateString("fr-DZ")}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{t(o.status)}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => generateInvoicePDF(o)} style={{ padding: "4px 8px", background: "#C8F000", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#1C1C1C" }}>
                            <FileText size={12} /> PDF
                          </button>
                          <button onClick={() => openEdit(o)} style={{ fontSize: 12, color: "#C8F000", background: "#1C1C1C", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{t("edit")}</button>
                          <button onClick={() => del(o.id)} style={{ fontSize: 12, color: "#dc2626", background: "#FEE2E2", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>✕</button>
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

      {/* Smart Order Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: card, borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: text }}>{editing ? t("edit") : t("new_order")}</h2>
                {!editing && <p style={{ margin: "2px 0 0", fontSize: 12, color: muted }}>Code auto: {generateCode()}</p>}
              </div>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
            </div>

            {/* PRODUCT SELECTOR */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Package size={13} /> Produit
              </label>
              <div style={{ position: "relative" }}>
                <input
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); setSelectedProduct(null); }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Rechercher un produit..."
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }} />

                {showProductDropdown && filteredProducts.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: card, border: `1px solid ${inputBorder}`, borderRadius: 8, zIndex: 10, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", marginTop: 4 }}>
                    {filteredProducts.map(p => (
                      <div key={p.id} onClick={() => { setSelectedProduct(p); setProductSearch(p.name); setShowProductDropdown(false); }}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = darkMode ? "#2A2A2A" : "#F9F9F9"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: text }}>{p.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>{p.category} • {fmt(p.price_dzd)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: p.stock <= 5 ? "#dc2626" : p.stock <= 15 ? "#ca8a04" : "#16a34a" }}>{p.stock} en stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected product info */}
              {selectedProduct && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: darkMode ? "#2A2A2A" : "#F0FFF4", borderRadius: 8, border: "1px solid #16a34a22" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#16a34a" }}>✓ {selectedProduct.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>{selectedProduct.category} • Prix: {fmt(selectedProduct.price_dzd)} / unité</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 11, color: selectedProduct.stock <= 5 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{selectedProduct.stock} disponibles</p>
                      {qty > selectedProduct.stock && (
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "#dc2626", fontWeight: 600 }}>⚠ Stock insuffisant!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QTY */}
            {selectedProduct && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>{t("qty")}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${inputBorder}`, background: card, color: text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" value={qty} min={1} max={selectedProduct.stock}
                    onChange={e => setQty(Math.min(selectedProduct.stock, Math.max(1, Number(e.target.value))))}
                    style={{ ...inputStyle, width: 80, textAlign: "center" }} />
                  <button onClick={() => setQty(Math.min(selectedProduct.stock, qty + 1))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${inputBorder}`, background: card, color: text, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  <div style={{ flex: 1, padding: "8px 14px", background: "#1C1C1C", borderRadius: 8, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Total</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#C8F000" }}>{fmt(totalPrice)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CLIENT SELECTOR */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <User size={13} /> Client
              </label>

              {!isNewClient ? (
                <>
                  <div style={{ position: "relative" }}>
                    <input
                      value={clientSearch}
                      onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); setSelectedCustomer(null); }}
                      onFocus={() => setShowClientDropdown(true)}
                      placeholder="Rechercher un client..."
                      style={{ ...inputStyle, paddingRight: 36 }}
                    />
                    <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }} />

                    {showClientDropdown && filteredCustomers.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: card, border: `1px solid ${inputBorder}`, borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", marginTop: 4 }}>
                        {filteredCustomers.map(c => {
                          const st = clientStatusStyle[c.status] || clientStatusStyle.new;
                          return (
                            <div key={c.id} onClick={() => { setSelectedCustomer(c); setClientSearch(c.name); setShowClientDropdown(false); }}
                              style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = darkMode ? "#2A2A2A" : "#F9F9F9"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: text }}>{c.name}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>{c.email}</p>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: st.bg, color: st.color }}>{t(c.status)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedCustomer && (
                    <div style={{ marginTop: 10, padding: "10px 14px", background: darkMode ? "#2A2A2A" : "#F0F9FF", borderRadius: 8, border: "1px solid #2563eb22" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#2563eb" }}>✓ {selectedCustomer.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: muted }}>{selectedCustomer.email} • {selectedCustomer.phone}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: clientStatusStyle[selectedCustomer.status]?.bg, color: clientStatusStyle[selectedCustomer.status]?.color }}>{t(selectedCustomer.status)}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={() => setIsNewClient(true)}
                    style={{ marginTop: 8, fontSize: 12, color: "#C8F000", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
                    + Nouveau client
                  </button>
                </>
              ) : (
                <div style={{ padding: 16, background: darkMode ? "#2A2A2A" : "#F9F9F9", borderRadius: 10, border: `1px solid ${inputBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#C8F000" }}>➕ Nouveau client</p>
                    <button onClick={() => setIsNewClient(false)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 11 }}>← Client existant</button>
                  </div>
                  {[["Nom complet", "name"], ["Email", "email"], ["Téléphone", "phone"]].map(([label, key]) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: "block", marginBottom: 3 }}>{label}</label>
                      <input value={(newClient as any)[key]} onChange={e => setNewClient({ ...newClient, [key]: e.target.value })}
                        style={{ ...inputStyle, background: card }} />
                    </div>
                  ))}
                  <p style={{ fontSize: 10, color: muted, margin: "6px 0 0" }}>
                    ℹ️ Ce client sera créé automatiquement avec le statut <strong>Nouveau</strong>. Son statut évoluera selon ses achats.
                  </p>
                </div>
              )}
            </div>

            {/* STATUS */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>{t("status")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["pending", "processing", "delivered", "cancelled"].map(s => {
                  const st = statusStyle[s];
                  return (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      padding: "7px 16px", borderRadius: 8, border: `2px solid ${status === s ? st.color : inputBorder}`,
                      background: status === s ? st.bg : card, color: status === s ? st.color : muted,
                      fontSize: 12, fontWeight: status === s ? 700 : 400, cursor: "pointer"
                    }}>{t(s)}</button>
                  );
                })}
              </div>
              {status === "delivered" && selectedProduct && qty <= selectedProduct.stock && (
                <p style={{ fontSize: 11, color: "#16a34a", marginTop: 6, fontWeight: 500 }}>
                  ✓ Stock: {selectedProduct.stock} → {selectedProduct.stock - qty} après livraison
                </p>
              )}
            </div>

            {/* SUMMARY */}
            {selectedProduct && (selectedCustomer || (isNewClient && newClient.name)) && (
              <div style={{ padding: "12px 16px", background: "#1C1C1C", borderRadius: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#aaa" }}>Produit</span>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{selectedProduct.name} ×{qty}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#aaa" }}>Client</span>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{selectedCustomer?.name || newClient.name}</span>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: 15, color: "#C8F000", fontWeight: 700 }}>{fmt(totalPrice)}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${inputBorder}`, borderRadius: 8, background: card, color: text, fontSize: 13, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} disabled={saving || (!selectedProduct && !editing) || (!selectedCustomer && !isNewClient && !editing)}
                style={{ flex: 1, padding: "11px", background: "#C8F000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#1C1C1C", opacity: (saving || (!selectedProduct && !editing)) ? 0.6 : 1 }}>
                {saving ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
