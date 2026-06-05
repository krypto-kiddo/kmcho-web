"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { FormEvent } from "react";

interface Order {
  id: number;
  user_id: number;
  status: string;
  description: string;
  order_date: string;
  created_at: string;
  amount: string | null;
}

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
}

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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const [newAmount, setNewAmount] = useState("");
  const [amountSaving, setAmountSaving] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [amountSuccess, setAmountSuccess] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) { router.push("/"); return; }

    async function loadOrder() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { router.push("/admin/orders"); return; }
        const data = await res.json();
        setOrder(data);
        setDescription(data.description || "");
        setStatus(data.status);
        setOrderDate(new Date(data.order_date || data.created_at).toISOString().split("T")[0]);

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${data.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setCustomer(userData);
      } catch {
        router.push("/admin/orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      if (status !== order?.status) {
        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        });
        if (!statusRes.ok) { const d = await statusRes.json(); setError(d.detail || "Failed to update status"); return; }
      }

      const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description, order_date: new Date(orderDate).toISOString() }),
      });
      if (!updateRes.ok) { const d = await updateRes.json(); setError(d.detail || "Failed to update order"); return; }
      const updated = await updateRes.json();
      setOrder(updated);
      setSuccess("Order updated successfully");
    } catch {
      setError("Could not connect to server");
    } finally {
      setSaving(false);
    }
  }

  async function handleAmountUpdate() {
    setAmountError(""); setAmountSuccess("");
    if (!newAmount || parseFloat(newAmount) <= 0) { setAmountError("Enter a valid amount"); return; }
    setAmountSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/amount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_amount: parseFloat(newAmount) }),
      });
      const d = await res.json();
      if (!res.ok) { setAmountError(d.detail || "Failed to update amount"); return; }
      setAmountSuccess(`Updated: ₹${d.old_amount} → ₹${d.new_amount}`);
      setNewAmount("");
    } catch {
      setAmountError("Could not connect to server");
    } finally {
      setAmountSaving(false);
    }
  }

  function statusColor(s: string) {
    if (s === "delivered") return "#2e7d32";
    if (s === "cancelled") return "#c0392b";
    return "#b8860b";
  }

  function statusBg(s: string) {
    if (s === "delivered") return "rgba(46,125,50,0.1)";
    if (s === "cancelled") return "rgba(192,57,43,0.1)";
    return "rgba(184,134,11,0.1)";
  }

  if (loading) return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.4)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ ...glassCard, padding: "20px 32px", position: "relative", zIndex: 1 }}>
        <p style={{ color: "#9a8060", fontSize: "13px" }}>Loading...</p>
      </div>
    </main>
  );

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
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "#9a8060", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600 }}>Order #{orderId}</h1>
          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>{customer?.name || "Loading..."}</p>
        </div>
        <span style={{
          marginLeft: "auto",
          fontSize: "11px", fontWeight: 500,
          color: statusColor(order?.status || ""),
          background: statusBg(order?.status || ""),
          border: `1px solid ${statusColor(order?.status || "")}44`,
          borderRadius: "6px", padding: "4px 10px", textTransform: "capitalize",
        }}>
          {order?.status}
        </span>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Customer card */}
        <div
          style={{
            ...glassCard, borderRadius: "10px",
            padding: "14px 16px", marginBottom: "16px",
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "border-color 0.15s",
          }}
          onClick={() => router.push(`/admin/${customer?.id}`)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"}
        >
          <div>
            <p style={{ fontSize: "13px", color: "#3a3020", marginBottom: "3px", fontWeight: 500 }}>{customer?.name}</p>
            <p style={{ fontSize: "11px", color: "#b09a70" }}>{customer?.phone || customer?.email || "—"}</p>
          </div>
          <span style={{ fontSize: "11px", color: "#b09a70" }}>View →</span>
        </div>

        {/* Edit form */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Edit order</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Order date</label>
              <input
                type="date" value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Note</label>
              <input
                type="text" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Chicken + rice"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...glassInput, cursor: "pointer" }}
              >
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {error && (
              <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {success}
              </p>
            )}

            <button
              type="submit" disabled={saving}
              style={{
                background: saving ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#5a3e10", fontWeight: 600, fontSize: "14px",
                borderRadius: "8px", padding: "11px",
                cursor: saving ? "not-allowed" : "pointer", width: "100%",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Amount edit */}
        <div style={{ ...glassCard, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" as const }}>Order amount</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          {order?.status === "cancelled" && (
            <p style={{ fontSize: "11px", color: "#b8860b", background: "rgba(184,134,11,0.08)", border: "1px solid rgba(184,134,11,0.25)", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px" }}>
              This order is cancelled — updating the amount will also update the refund entry. Customer balance will not change.
            </p>
          )}

          <p style={{ fontSize: "12px", color: "#b09a70", marginBottom: "10px" }}>
            Current amount: <span style={{ color: "#8a6a28", fontWeight: 500 }}>
              {order?.amount ? `₹${order.amount}` : "—"}
            </span>
          </p>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number" value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="New amount (₹)" min="1"
              style={{ ...glassInput, flex: 1, width: "auto" }}
              onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
            />
            <button
              type="button"
              onClick={handleAmountUpdate}
              disabled={amountSaving}
              style={{
                background: amountSaving ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#5a3e10", fontWeight: 600, fontSize: "14px",
                borderRadius: "8px", padding: "10px 20px",
                cursor: amountSaving ? "not-allowed" : "pointer",
                whiteSpace: "nowrap" as const,
              }}
            >
              {amountSaving ? "Saving..." : "Update"}
            </button>
          </div>

          {amountError && (
            <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px", marginTop: "10px" }}>
              {amountError}
            </p>
          )}
          {amountSuccess && (
            <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px", marginTop: "10px" }}>
              {amountSuccess}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}