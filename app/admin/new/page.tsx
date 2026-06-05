"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

const glassCard = {
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.7)",
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(160,130,80,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
} as React.CSSProperties;

const glassInput = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(180,150,90,0.25)",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#3a3020",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

export default function NewCustomer() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Failed to create customer"); return; }
      router.push(`/admin/${data.id}`);
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      paddingBottom: "40px",
    }}>

      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.4)", zIndex: 0, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{
        ...glassCard,
        borderRadius: 0,
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderBottom: "1px solid rgba(255,255,255,0.5)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: "12px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          style={{ background: "none", border: "none", color: "#9a8060", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600 }}>New customer</h1>
          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>Create a customer account</p>
        </div>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        <div style={{ ...glassCard, padding: "24px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>
              Customer details
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>
                Name <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                required placeholder="e.g. Rohan Mehta"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Phone</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>
                Email <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="e.g. rohan@example.com"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>
                Password <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="Set a login password"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
              <p style={{ fontSize: "11px", color: "#b09a70" }}>
                Customers use this to log in and view their balance.
              </p>
            </div>

            {error && (
              <div style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: "4px",
                background: loading ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#5a3e10", fontWeight: 600, fontSize: "14px",
                borderRadius: "8px", padding: "11px",
                cursor: loading ? "not-allowed" : "pointer", width: "100%",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "rgba(226,201,126,0.9)"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "rgba(201,168,76,0.85)"; }}
            >
              {loading ? "Creating..." : "Create customer"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}