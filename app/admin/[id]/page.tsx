"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  current_balance: number;
  is_admin: boolean;
  created_at: string;
}

interface LedgerEntry {
  id: number;
  type: string;
  amount: number;
  mode_of_payment: string;
  transaction_id: string;
  status: string;
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

export default function CustomerDetail() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "orders">("ledger");

  // Credit form
  const [creditAmount, setCreditAmount] = useState("");
  const [creditMode, setCreditMode] = useState("UPI");
  const [creditNote, setCreditNote] = useState("");
  const [creditTransactionId, setCreditTransactionId] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditError, setCreditError] = useState("");
  const [creditSuccess, setCreditSuccess] = useState("");

  // Order form
  const [orderNote, setOrderNote] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderAmount, setOrderAmount] = useState("100");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadData() {
    if (!token) { router.push("/"); return; }
    try {
      const [userRes, ledgerRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ledger/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const userData = await userRes.json();
      const ledgerData = await ledgerRes.json();
      const ordersData = await ordersRes.json();
      setUser(userData);
      setLedger(ledgerData);
      setOrders(ordersData.filter((o: Order & { user_id: number }) => o.user_id === parseInt(userId)));
    } catch {
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [userId]);

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setCreditError(""); setCreditSuccess("");
    setCreditLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ledger/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: parseInt(userId),
          type: "credit",
          amount: parseFloat(creditAmount),
          mode_of_payment: creditMode,
          transaction_id: creditTransactionId || null,
          description: creditNote || `Top-up via ${creditMode}`,
        }),
      });
      if (!res.ok) { const d = await res.json(); setCreditError(d.detail || "Failed"); return; }
      setCreditSuccess("Balance updated successfully");
      setCreditAmount(""); setCreditNote("");setCreditTransactionId("");
      loadData();
    } catch {
      setCreditError("Could not connect to server");
    } finally {
      setCreditLoading(false);
    }
  }

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderError(""); setOrderSuccess("");
    setOrderLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: parseInt(userId),
          amount: parseFloat(orderAmount),
          description: orderNote || "Daily meal",
          order_date: new Date().toISOString(),
        }),
      });
      if (!res.ok) { const d = await res.json(); setOrderError(d.detail || "Failed"); return; }
      setOrderSuccess("Order created successfully");
      setOrderNote("");setOrderAmount("100");
      loadData();
    } catch {
      setOrderError("Could not connect to server");
    } finally {
      setOrderLoading(false);
    }
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

  function balanceColor(balance: number) {
    if (balance <= 0) return "#8b3a3a";
    if (balance < 500) return "#b8860b";
    return "#4a7c4a";
  }

  if (loading) return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6a5f52", fontSize: "13px" }}>Loading...</p>
    </main>
  );

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
          <h1 style={{ color: "#e8e0d0", fontSize: "16px", fontWeight: 600 }}>{user?.name}</h1>
          <p style={{ color: "#6a5f52", fontSize: "11px", marginTop: "1px" }}>{user?.phone || user?.email || "—"}</p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Balance card */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", color: "#6a5f52", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Wallet balance
          </p>
          <p style={{ fontSize: "36px", fontWeight: 700, color: balanceColor(Number(user?.current_balance)) }}>
            ₹{Number(user?.current_balance).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Add credit form */}
        <form onSubmit={handleCredit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Amount (₹)</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  required
                  placeholder="500"
                  style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                  onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                  onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Mode</label>
                <select
                  value={creditMode}
                  onChange={(e) => setCreditMode(e.target.value)}
                  style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {creditMode !== "Cash" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>
                  Transaction ID
                  <span style={{ color: "#6a5f52", marginLeft: "4px" }}>
                    {creditMode === "UPI" ? "(UTR number)" : "(reference number)"}
                  </span>
                </label>
                <input
                  type="text"
                  value={creditTransactionId}
                  onChange={(e) => setCreditTransactionId(e.target.value)}
                  placeholder={creditMode === "UPI" ? "e.g. 407721318453" : "e.g. REF123456"}
                  style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                  onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                  onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Note (optional)</label>
              <input
                type="text"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="e.g. October recharge"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {creditError && <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>{creditError}</p>}
            {creditSuccess && <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px" }}>{creditSuccess}</p>}

            <button
              type="submit"
              disabled={creditLoading}
              style={{ backgroundColor: creditLoading ? "#8a6f3a" : "#c9a84c", color: "#1a1612", fontWeight: 600, fontSize: "13px", borderRadius: "8px", padding: "10px", border: "none", cursor: creditLoading ? "not-allowed" : "pointer", width: "100%" }}
            >
              {creditLoading ? "Processing..." : "Add credit"}
            </button>
          </form>

        {/* Create order form */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Create order</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>
          <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Amount (₹)</label>
                <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    required
                    placeholder="100"
                    style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                    onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Note (optional)</label>
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Chicken + rice"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>
            {orderError && <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>{orderError}</p>}
            {orderSuccess && <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px" }}>{orderSuccess}</p>}
            <button
              type="submit"
              disabled={orderLoading}
              style={{ backgroundColor: "transparent", color: "#c9a84c", fontWeight: 600, fontSize: "13px", borderRadius: "8px", padding: "10px", border: "1px solid #c9a84c", cursor: orderLoading ? "not-allowed" : "pointer", width: "100%", opacity: orderLoading ? 0.5 : 1 }}
            >
              {orderLoading ? "Creating..." : `Create order — ₹${orderAmount || "0"}`}
            </button>
          </form>
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
            {ledger.length === 0 && <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>No entries yet</p>}
            {ledger.map((entry) => (
              <div key={entry.id} style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8e0d0", marginBottom: "3px" }}>{entry.description || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                    {entry.mode_of_payment && `${entry.mode_of_payment} · `}
                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: typeColor(entry.type) }}>
                  {entry.type === "debit" ? "-" : "+"}₹{Number(entry.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orders.length === 0 && <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>No orders yet</p>}
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8e0d0", marginBottom: "3px" }}>{order.description || "Daily meal"}</p>
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