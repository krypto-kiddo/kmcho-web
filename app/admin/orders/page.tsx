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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadData() {
    if (!token) { router.push("/"); return; }
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
    if (status === "delivered") return "#4a7c4a";
    if (status === "cancelled") return "#8b3a3a";
    return "#b8860b";
  }

  function statusBg(status: string) {
    if (status === "delivered") return "#1e2e1e";
    if (status === "cancelled") return "#2e1414";
    return "#2e2510";
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
          <h1 style={{ color: "#e8e0d0", fontSize: "16px", fontWeight: 600 }}>Orders</h1>
          <p style={{ color: "#6a5f52", fontSize: "11px", marginTop: "1px" }}>
            {pendingToday > 0 ? `${pendingToday} pending today` : "All caught up today"}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Filters */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Filters</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#e8e0d0", outline: "none", width: "100%" }}
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
          <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>
            Orders
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          <span style={{ fontSize: "10px", color: "#6a5f52" }}>{filtered.length}</span>
        </div>

        {loading && (
          <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>Loading...</p>
        )}

        {/* Order cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.length === 0 && !loading && (
            <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No orders found</p>
          )}
          {filtered.map((order) => {
            const customer = users[order.user_id];
            const isUpdating = updatingId === order.id;

            return (
              <div key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)} style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "16px", cursor: "pointer" }}>

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <p
                      style={{ fontSize: "14px", fontWeight: 500, color: "#e8e0d0", marginBottom: "3px", cursor: "pointer" }}
                      onClick={() => router.push(`/admin/${order.user_id}`)}
                    >
                      {customer?.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                      {order.description || "Daily meal"} · {new Date(order.order_date || order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: statusColor(order.status),
                    backgroundColor: statusBg(order.status),
                    border: `1px solid ${statusColor(order.status)}44`,
                    borderRadius: "6px",
                    padding: "4px 10px",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Action buttons — only for pending */}
                {order.status === "pending" && (
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, "delivered")}
                      style={{
                        flex: 2,
                        backgroundColor: "#1e2e1e",
                        border: "1px solid #4a7c4a44",
                        borderRadius: "8px",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#4a7c4a",
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    >
                      {isUpdating ? "Updating..." : "✓ Mark delivered"}
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, "cancelled")}
                      style={{
                        flex: 1,
                        backgroundColor: "#2e1414",
                        border: "1px solid #8b3a3a44",
                        borderRadius: "8px",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#8b3a3a",
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