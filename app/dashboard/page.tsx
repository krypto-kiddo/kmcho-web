"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  current_balance: number;
}

interface LedgerEntry {
  id: number;
  type: string;
  amount: number;
  mode_of_payment: string;
  description: string;
  created_at: string;
  order_id: number | null;
}

interface Order {
  id: number;
  status: string;
  description: string;
  order_date: string;
  created_at: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "orders">("ledger");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    async function loadData() {
      try {
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.status === 401) { router.push("/"); return; }
        const me = await meRes.json();
        if (me.is_admin) { router.push("/admin"); return; }
        setUser(me);

        const [ledgerRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/ledger/${me.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const ledgerData = await ledgerRes.json();
        const ordersData = await ordersRes.json();
        setLedger(ledgerData);
        setOrders(ordersData);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function balanceColor(balance: number) {
    if (balance <= 0) return "#8b3a3a";
    if (balance < 500) return "#b8860b";
    return "#4a7c4a";
  }

  function typeColor(type: string) {
    if (type === "credit") return "#4a7c4a";
    if (type === "debit") return "#8b3a3a";
    return "#b8860b";
  }

  function statusColor(status: string) {
    if (status === "delivered") return "#4a7c4a";
    if (status === "cancelled") return "#8b3a3a";
    return "#b8860b";
  }

  if (loading) return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6a5f52", fontSize: "13px" }}>Loading...</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #3a3020", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "#c9a84c", fontSize: "18px", fontWeight: 600, letterSpacing: "0.02em" }}>
            KMછો Canine
          </h1>
          <p style={{ color: "#6a5f52", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>
            {user?.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
          style={{ fontSize: "11px", color: "#6a5f52", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
        >
          Sign out
        </button>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Balance card */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "24px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#6a5f52", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
            Wallet balance
          </p>
          <p style={{ fontSize: "48px", fontWeight: 700, color: balanceColor(Number(user?.current_balance)), lineHeight: 1 }}>
            ₹{Number(user?.current_balance).toLocaleString("en-IN")}
          </p>
          {Number(user?.current_balance) < 500 && Number(user?.current_balance) > 0 && (
            <p style={{ fontSize: "12px", color: "#b8860b", marginTop: "10px", backgroundColor: "#2e2510", border: "1px solid #b8860b33", borderRadius: "6px", padding: "6px 12px", display: "inline-block" }}>
              Low balance — please recharge soon
            </p>
          )}
          {Number(user?.current_balance) <= 0 && (
            <p style={{ fontSize: "12px", color: "#8b3a3a", marginTop: "10px", backgroundColor: "#2e1414", border: "1px solid #8b3a3a33", borderRadius: "6px", padding: "6px 12px", display: "inline-block" }}>
              No balance — please recharge
            </p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "#6a5f52", marginBottom: "4px" }}>Total orders</p>
            <p style={{ fontSize: "22px", fontWeight: 600, color: "#e8e0d0" }}>{orders.length}</p>
          </div>
          <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "#6a5f52", marginBottom: "4px" }}>Spent this month</p>
            <p style={{ fontSize: "22px", fontWeight: 600, color: "#c9a84c" }}>
              ₹{ledger.filter(e => {
                const entryDate = new Date(e.created_at);
                const now = new Date();
                return e.type === "debit" && entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                }).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {(["ledger", "orders"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 500,
                border: activeTab === tab ? "1px solid #c9a84c" : "1px solid #3a3020",
                backgroundColor: activeTab === tab ? "#c9a84c22" : "transparent",
                color: activeTab === tab ? "#c9a84c" : "#6a5f52",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {tab} {tab === "ledger" ? `(${ledger.length})` : `(${orders.length})`}
            </button>
          ))}
        </div>

        {/* Ledger entries */}
        {activeTab === "ledger" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ledger.length === 0 && (
              <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No transactions yet</p>
            )}
            {ledger.map((entry) => (
              <div key={entry.id} style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8e0d0", marginBottom: "3px" }}>
                    {entry.description || (entry.type === "credit" ? "Wallet top-up" : "Meal deduction")}
                  </p>
                  <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                    {entry.mode_of_payment && `${entry.mode_of_payment} · `}
                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: typeColor(entry.type), whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {entry.type === "credit" ? "+" : "-"}₹{Number(entry.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orders.length === 0 && (
              <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No orders yet</p>
            )}
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8e0d0", marginBottom: "3px" }}>
                    {order.description || "Daily meal"}
                  </p>
                  <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: statusColor(order.status),
                  backgroundColor: order.status === "delivered" ? "#1e2e1e" : order.status === "cancelled" ? "#2e1414" : "#2e2510",
                  border: `1px solid ${statusColor(order.status)}44`,
                  borderRadius: "6px",
                  padding: "4px 10px",
                  textTransform: "capitalize",
                }}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}