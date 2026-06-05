"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  user_id: number;
  status: string;
  description: string;
  order_date: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
}

const glassCard = {
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
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
  padding: "8px 12px",
  fontSize: "13px",
  color: "#3a3020",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadData() {
    if (!token) { router.push("/"); return; }
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();
      setOrders(ordersData);
      const usersMap: Record<number, User> = {};
      usersData.forEach((u: User) => { usersMap[u.id] = u; });
      setUsers(usersMap);
    } catch {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function updateStatus(orderId: number, status: string) {
    setUpdatingId(orderId);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      await loadData();
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = orders.filter((o) => {
    const orderDay = new Date(o.order_date || o.created_at).toISOString().split("T")[0];
    const matchesDate = dateFilter ? orderDay === dateFilter : true;
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesDate && matchesStatus;
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingToday = orders.filter((o) => {
    const orderDay = new Date(o.created_at).toISOString().split("T")[0];
    return o.status === "pending" && orderDay === todayStr;
  }).length;

  function statusColor(status: string) {
    if (status === "delivered") return "#2e7d32";
    if (status === "cancelled") return "#c0392b";
    return "#b8860b";
  }

  function statusBg(status: string) {
    if (status === "delivered") return "rgba(46,125,50,0.1)";
    if (status === "cancelled") return "rgba(192,57,43,0.1)";
    return "rgba(184,134,11,0.1)";
  }

  if (loading) return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.png')",
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
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
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
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
          <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600 }}>Orders</h1>
          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>
            {pendingToday > 0 ? `${pendingToday} pending today` : "All caught up today"}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Filters */}
        <div style={{ ...glassCard, padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Filters</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Date</label>
              <input
                type="date" value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...glassInput, cursor: "pointer" }}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Orders</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          <span style={{ fontSize: "10px", color: "#b09a70" }}>{filtered.length}</span>
        </div>

        {/* Order cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.length === 0 && (
            <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No orders found</p>
          )}
          {filtered.map((order) => {
            const customer = users[order.user_id];
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                style={{
                  ...glassCard, borderRadius: "10px",
                  padding: "16px", cursor: "pointer",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(160,130,80,0.15), inset 0 1px 0 rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(160,130,80,0.08), inset 0 1px 0 rgba(255,255,255,0.8)";
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: order.status === "pending" ? "10px" : "0" }}>
                  <div>
                    <p
                      style={{ fontSize: "14px", fontWeight: 500, color: "#3a3020", marginBottom: "3px" }}
                      onClick={(e) => { e.stopPropagation(); router.push(`/admin/${order.user_id}`); }}
                    >
                      {customer?.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#b09a70" }}>
                      {order.description || "Daily meal"} · {new Date(order.order_date || order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: 500,
                    color: statusColor(order.status),
                    background: statusBg(order.status),
                    border: `1px solid ${statusColor(order.status)}44`,
                    borderRadius: "6px", padding: "4px 10px",
                    textTransform: "capitalize", whiteSpace: "nowrap",
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Action buttons — pending only */}
                {order.status === "pending" && (
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button" disabled={isUpdating}
                      onClick={() => updateStatus(order.id, "delivered")}
                      style={{
                        flex: 2,
                        background: "rgba(46,125,50,0.1)",
                        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(46,125,50,0.3)",
                        borderRadius: "8px", padding: "8px",
                        fontSize: "12px", fontWeight: 500, color: "#2e7d32",
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      {isUpdating ? "Updating..." : "✓ Mark delivered"}
                    </button>
                    <button
                      type="button" disabled={isUpdating}
                      onClick={() => updateStatus(order.id, "cancelled")}
                      style={{
                        flex: 1,
                        background: "rgba(192,57,43,0.08)",
                        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(192,57,43,0.25)",
                        borderRadius: "8px", padding: "8px",
                        fontSize: "12px", fontWeight: 500, color: "#c0392b",
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}