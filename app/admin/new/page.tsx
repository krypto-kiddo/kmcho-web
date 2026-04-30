"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to create customer");
        return;
      }

      router.push(`/admin/${data.id}`);
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #3a3020", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          style={{ background: "none", border: "none", color: "#6a5f52", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: "#e8e0d0", fontSize: "16px", fontWeight: 600 }}>New customer</h1>
          <p style={{ color: "#6a5f52", fontSize: "11px", marginTop: "1px" }}>Create a customer account</p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "24px" }}>

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>
              Customer details
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>
                Name <span style={{ color: "#8b3a3a" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Rohan Mehta"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>
                Email <span style={{ color: "#8b3a3a" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. rohan@example.com"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>
                Password <span style={{ color: "#8b3a3a" }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Set a login password"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
              <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                Customers use this to log in and view their balance.
              </p>
            </div>

            {error && (
              <div style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "4px", backgroundColor: loading ? "#8a6f3a" : "#c9a84c", color: "#1a1612", fontWeight: 600, fontSize: "14px", borderRadius: "8px", padding: "11px", border: "none", cursor: loading ? "not-allowed" : "pointer", width: "100%" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#e2c97e"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = loading ? "#8a6f3a" : "#c9a84c"; }}
            >
              {loading ? "Creating..." : "Create customer"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}