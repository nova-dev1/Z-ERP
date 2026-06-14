"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = "/";
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F0F0F0",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "#1C1C1C",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <Zap size={24} color="#C8F000" fill="#C8F000" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>ETS ZAIMI</h1>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          {/* Google Button */}
          <button onClick={handleGoogle} style={{
            width: "100%", padding: "11px 16px", border: "1.5px solid #E5E7EB",
            borderRadius: 10, background: "#fff", fontSize: 14, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 20, transition: "all 0.15s",
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continuer avec Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            <span style={{ fontSize: 12, color: "#aaa" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmail}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ets-zaimi.dz" required
                  style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: "100%", paddingLeft: 36, paddingRight: 40, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#FEE2E2", color: "#dc2626", fontSize: 12, padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", background: "#C8F000", border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>
          ETS ZAIMI ERP — Accès réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}
