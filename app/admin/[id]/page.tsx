"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ConfirmModal from "@/app/components/ConfirmModal";

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

interface PendingAction {
  type: "charge" | "credit";
  amount: string;
  description: string;
  mode?: string;
  date?: string;
  execute: () => Promise<void>;
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
  padding: "9px 12px",
  fontSize: "14px",
  color: "#3a3020",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

const detailRow = (label: string, value: string) => (
  <div key={label}>
    <p style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b09a70", marginBottom: "2px" }}>
      {label}
    </p>
    <p style={{ fontSize: "14px", fontWeight: 600, color: "#3a3020" }}>{value}</p>
  </div>
);

export default function CustomerDetail() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "orders">("ledger");

  const [creditAmount, setCreditAmount] = useState("");
  const [creditMode, setCreditMode] = useState("UPI");
  const [creditNote, setCreditNote] = useState("");
  const [creditTransactionId, setCreditTransactionId] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditError, setCreditError] = useState("");
  const [creditSuccess, setCreditSuccess] = useState("");

  const [orderNote, setOrderNote] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderAmount, setOrderAmount] = useState("100");
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

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

  // ── Credit ────────────────────────────────────────────────────────────────

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setCreditError(""); setCreditSuccess("");

    setPendingAction({
      type: "credit",
      amount: creditAmount,
      description: creditNote || `Top-up via ${creditMode}`,
      mode: creditMode,
      execute: async () => {
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
          setCreditAmount(""); setCreditNote(""); setCreditTransactionId("");
          loadData();
        } catch {
          setCreditError("Could not connect to server");
        } finally {
          setCreditLoading(false);
        }
      },
    });
  }

  // ── Order ─────────────────────────────────────────────────────────────────

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderError(""); setOrderSuccess("");

    setPendingAction({
      type: "charge",
      amount: orderAmount,
      description: orderNote || "Daily meal",
      date: orderDate,
      execute: async () => {
        setOrderLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              user_id: parseInt(userId),
              amount: parseFloat(orderAmount),
              description: orderNote || "Daily meal",
              order_date: new Date(orderDate).toISOString(),
            }),
          });
          if (!res.ok) { const d = await res.json(); setOrderError(d.detail || "Failed"); return; }
          setOrderSuccess("Order created successfully");
          setOrderNote(""); setOrderAmount("0"); setOrderDate(new Date().toISOString().split("T")[0]);
          loadData();
        } catch {
          setOrderError("Could not connect to server");
        } finally {
          setOrderLoading(false);
        }
      },
    });
  }

  // ── Confirm / Cancel ──────────────────────────────────────────────────────

  async function handleConfirm() {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null); // close modal first so the user sees the loading state on the form
    await action.execute();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function typeColor(type: string) {
    if (type === "credit") return "#2e7d32";
    if (type === "debit") return "#c0392b";
    return "#b8860b";
  }

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

  function balanceColor(balance: number) {
    if (balance <= 0) return "#c0392b";
    if (balance < 500) return "#b8860b";
    return "#2e7d32";
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ ...glassCard, padding: "20px 32px" }}>
        <p style={{ color: "#9a8060", fontSize: "13px" }}>Loading...</p>
      </div>
    </main>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      paddingBottom: "40px",
    }}>

      {/* Overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.4)", zIndex: 0, pointerEvents: "none" }} />

      {/* ── Confirmation modal ── */}
      <ConfirmModal
        isOpen={pendingAction !== null}
        title={pendingAction?.type === "charge" ? "Create order" : "Add credit"}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      >
        {pendingAction && (
          <>
            {detailRow(
              "Type",
              pendingAction.type === "charge" ? "Debit (order)" : "Credit"
            )}
            {detailRow(
              "Amount",
              `₹${Number(pendingAction.amount).toLocaleString("en-IN")}`
            )}
            {pendingAction.mode && detailRow("Mode", pendingAction.mode)}
            {detailRow("Description", pendingAction.description)}
            {pendingAction.date && detailRow(
              "Date",
              new Date(pendingAction.date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })
            )}
          </>
        )}
      </ConfirmModal>

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
        <button
          type="button"
          onClick={() => router.push(`/invoice/${userId}`)}
          style={{
            background: "rgba(201,168,76,0.15)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "#8a6a28",
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer",
          }}
        >
          Statement
        </button>
        <div>
          <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600 }}>{user?.name}</h1>
          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>{user?.phone || user?.email || "—"}</p>
        </div>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Balance card */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", color: "#b09a70", marginBottom: "6px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Wallet balance
          </p>
          <p style={{ fontSize: "36px", fontWeight: 700, color: balanceColor(Number(user?.current_balance)) }}>
            ₹{Number(user?.current_balance).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Add credit form */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Add credit</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>
          <form onSubmit={handleCredit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#9a8060" }}>Amount (₹)</label>
                <input
                  type="number" value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  required placeholder="500"
                  style={glassInput}
                  onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#9a8060" }}>Mode</label>
                <select
                  value={creditMode} onChange={(e) => setCreditMode(e.target.value)}
                  style={{ ...glassInput, cursor: "pointer" }}
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
                <label style={{ fontSize: "11px", color: "#9a8060" }}>
                  Transaction ID
                  <span style={{ color: "#b09a70", marginLeft: "4px" }}>
                    {creditMode === "UPI" ? "(UTR number)" : "(reference number)"}
                  </span>
                </label>
                <input
                  type="text" value={creditTransactionId}
                  onChange={(e) => setCreditTransactionId(e.target.value)}
                  placeholder={creditMode === "UPI" ? "e.g. 407721318453" : "e.g. REF123456"}
                  style={glassInput}
                  onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Note (optional)</label>
              <input
                type="text" value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="e.g. October recharge"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            {creditError && (
              <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {creditError}
              </p>
            )}
            {creditSuccess && (
              <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {creditSuccess}
              </p>
            )}

            <button
              type="submit" disabled={creditLoading}
              style={{
                background: creditLoading ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#5a3e10", fontWeight: 600, fontSize: "13px",
                borderRadius: "8px", padding: "10px", cursor: creditLoading ? "not-allowed" : "pointer", width: "100%",
              }}
            >
              {creditLoading ? "Processing..." : "Add credit"}
            </button>
          </form>
        </div>

        {/* Create order form */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Create order</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>
          <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Amount (₹)</label>
              <input
                type="number" value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                required placeholder="100"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>
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
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Note (optional)</label>
              <input
                type="text" value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Chicken + rice"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
              />
            </div>

            {orderError && (
              <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {orderError}
              </p>
            )}
            {orderSuccess && (
              <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                {orderSuccess}
              </p>
            )}

            <button
              type="submit" disabled={orderLoading}
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                color: "#8a6a28", fontWeight: 600, fontSize: "13px",
                borderRadius: "8px", padding: "10px",
                border: "1px solid rgba(201,168,76,0.4)",
                cursor: orderLoading ? "not-allowed" : "pointer", width: "100%",
                opacity: orderLoading ? 0.5 : 1,
              }}
            >
              {orderLoading ? "Creating..." : `Create order — ₹${orderAmount || "0"}`}
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {(["ledger", "orders"] as const).map((tab) => (
            <button
              key={tab} type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: activeTab === tab ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.6)",
                background: activeTab === tab ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.4)",
                color: activeTab === tab ? "#8a6a28" : "#b09a70",
                cursor: "pointer", textTransform: "capitalize",
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
              <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>No entries yet</p>
            )}
            {ledger.map((entry) => (
              <div key={entry.id} style={{
                ...glassCard, borderRadius: "10px",
                padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#3a3020", marginBottom: "3px" }}>{entry.description || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#b09a70" }}>
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
            {orders.length === 0 && (
              <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>No orders yet</p>
            )}
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                style={{
                  ...glassCard, borderRadius: "10px",
                  padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
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
                <div>
                  <p style={{ fontSize: "13px", color: "#3a3020", marginBottom: "3px" }}>{order.description || "Daily meal"}</p>
                  <p style={{ fontSize: "11px", color: "#b09a70" }}>
                    {new Date(order.order_date || order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 500,
                  color: statusColor(order.status),
                  background: statusBg(order.status),
                  border: `1px solid ${statusColor(order.status)}44`,
                  borderRadius: "6px", padding: "4px 10px", textTransform: "capitalize",
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