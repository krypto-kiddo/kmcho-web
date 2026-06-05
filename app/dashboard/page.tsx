"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

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

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "orders">("ledger");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onboardingPhone, setOnboardingPhone] = useState("");
  const [onboardingError, setOnboardingError] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
        if (!me.is_onboarded) setShowOnboarding(true);

        const [ledgerRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/ledger/${me.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setLedger(await ledgerRes.json());
        setOrders(await ordersRes.json());
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleOnboarding(e: FormEvent) {
    e.preventDefault();
    setOnboardingError("");
    if (newPassword !== confirmPassword) { setOnboardingError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setOnboardingError("Password must be at least 6 characters"); return; }
    setOnboardingLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: onboardingPhone || undefined, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setOnboardingError(data.detail || "Something went wrong"); return; }
      setUser(data);
      setShowOnboarding(false);
    } catch {
      setOnboardingError("Could not connect to server");
    } finally {
      setOnboardingLoading(false);
    }
  }

  function balanceColor(balance: number) {
    if (balance <= 0) return "#c0392b";
    if (balance < 500) return "#b8860b";
    return "#2e7d32";
  }

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

  const spentThisMonth = ledger.filter(e => {
    const d = new Date(e.created_at);
    const now = new Date();
    return e.type === "debit" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + Number(e.amount), 0);

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
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <h1 style={{ color: "#8a6a28", fontSize: "18px", fontWeight: 600, letterSpacing: "0.02em" }}>
            KMછો Canine
          </h1>
          <p style={{ color: "#b09a70", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>
            {user?.name}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button type="button" onClick={() => router.push("/profile")}
            style={{ fontSize: "11px", color: "#9a8060", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>
            Profile
          </button>
          <button type="button" onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            style={{ fontSize: "11px", color: "#9a8060", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Balance card */}
        <div style={{ ...glassCard, padding: "24px", marginBottom: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#b09a70", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
            Wallet balance
          </p>
          <p style={{ fontSize: "48px", fontWeight: 700, color: balanceColor(Number(user?.current_balance)), lineHeight: 1 }}>
            ₹{Number(user?.current_balance).toLocaleString("en-IN")}
          </p>
          {Number(user?.current_balance) < 500 && Number(user?.current_balance) > 0 && (
            <p style={{ fontSize: "12px", color: "#b8860b", marginTop: "10px", background: "rgba(184,134,11,0.1)", border: "1px solid rgba(184,134,11,0.25)", borderRadius: "6px", padding: "6px 12px", display: "inline-block" }}>
              Low balance — please recharge soon
            </p>
          )}
          {Number(user?.current_balance) <= 0 && (
            <p style={{ fontSize: "12px", color: "#c0392b", marginTop: "10px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.25)", borderRadius: "6px", padding: "6px 12px", display: "inline-block" }}>
              No balance — please recharge
            </p>
          )}
        </div>

        {/* Statement button */}
        <button
          type="button"
          onClick={() => router.push(`/invoice/${user?.id}`)}
          style={{
            width: "100%", marginBottom: "12px",
            background: "rgba(255,255,255,0.4)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: "10px", padding: "12px",
            fontSize: "13px", color: "#8a6a28", cursor: "pointer", letterSpacing: "0.05em",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
        >
          View Statement
        </button>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div style={{ ...glassCard, borderRadius: "10px", padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "#b09a70", marginBottom: "4px" }}>Total orders</p>
            <p style={{ fontSize: "22px", fontWeight: 600, color: "#3a3020" }}>{orders.length}</p>
          </div>
          <div style={{ ...glassCard, borderRadius: "10px", padding: "14px" }}>
            <p style={{ fontSize: "11px", color: "#b09a70", marginBottom: "4px" }}>Spent this month</p>
            <p style={{ fontSize: "22px", fontWeight: 600, color: "#8a6a28" }}>
              ₹{spentThisMonth.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {(["ledger", "orders"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
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
            {ledger.length === 0 && <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No transactions yet</p>}
            {ledger.map((entry) => (
              <div key={entry.id} style={{ ...glassCard, borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#3a3020", marginBottom: "3px" }}>
                    {entry.description || (entry.type === "credit" ? "Wallet top-up" : "Meal deduction")}
                  </p>
                  <p style={{ fontSize: "11px", color: "#b09a70" }}>
                    {entry.mode_of_payment && `${entry.mode_of_payment} · `}
                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: typeColor(entry.type), whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {entry.type === "debit" ? "-" : "+"}₹{Number(entry.amount).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {orders.length === 0 && <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>No orders yet</p>}
            {orders.map((order) => (
              <div key={order.id} style={{ ...glassCard, borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      {/* Onboarding modal */}
      {showOnboarding && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          backgroundColor: "rgba(250,245,235,0.6)",
        }}>
          <div style={{ ...glassCard, padding: "28px", width: "100%", maxWidth: "360px" }}>

            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: "#8a6a28", fontSize: "18px", fontWeight: 600, marginBottom: "6px" }}>
                Welcome to KMછો!
              </h2>
              <p style={{ color: "#9a8060", fontSize: "13px", lineHeight: 1.5 }}>
                Let's set up your account. Please set a personal password to secure your wallet.
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
              {[1, 2].map((step) => (
                <div key={step} style={{
                  flex: 1, height: "3px", borderRadius: "2px",
                  background: onboardingStep >= step ? "rgba(201,168,76,0.8)" : "rgba(180,150,90,0.2)",
                  transition: "background 0.2s",
                }} />
              ))}
            </div>

            <form
              onSubmit={onboardingStep === 1 ? (e) => { e.preventDefault(); setOnboardingStep(2); } : handleOnboarding}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {onboardingStep === 1 && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", color: "#9a8060" }}>New password</label>
                    <input
                      type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required placeholder="Min 6 characters"
                      style={glassInput}
                      onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", color: "#9a8060" }}>Confirm password</label>
                    <input
                      type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required placeholder="Repeat password"
                      style={glassInput}
                      onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
                    />
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ fontSize: "12px", color: "#c0392b" }}>Passwords do not match</p>
                  )}
                  <button
                    type="submit"
                    disabled={newPassword.length < 6 || newPassword !== confirmPassword}
                    style={{
                      background: "rgba(201,168,76,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(201,168,76,0.4)", color: "#5a3e10",
                      fontWeight: 600, fontSize: "14px", borderRadius: "8px", padding: "11px",
                      cursor: "pointer", width: "100%",
                      opacity: newPassword.length < 6 || newPassword !== confirmPassword ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </>
              )}

              {onboardingStep === 2 && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", color: "#9a8060" }}>
                      Phone number <span style={{ color: "#b09a70", marginLeft: "4px" }}>(optional)</span>
                    </label>
                    <input
                      type="tel" value={onboardingPhone}
                      onChange={(e) => setOnboardingPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      style={glassInput}
                      onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"}
                    />
                    <p style={{ fontSize: "11px", color: "#b09a70" }}>
                      We'll use this to contact you about your orders.
                    </p>
                  </div>

                  {onboardingError && (
                    <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>
                      {onboardingError}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button" onClick={() => setOnboardingStep(1)}
                      style={{
                        flex: 1, background: "rgba(255,255,255,0.5)",
                        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        color: "#9a8060", fontWeight: 500, fontSize: "14px",
                        borderRadius: "8px", padding: "11px",
                        border: "1px solid rgba(180,150,90,0.25)", cursor: "pointer",
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit" disabled={onboardingLoading}
                      style={{
                        flex: 2,
                        background: onboardingLoading ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(201,168,76,0.4)",
                        color: "#5a3e10", fontWeight: 600, fontSize: "14px",
                        borderRadius: "8px", padding: "11px", cursor: "pointer",
                      }}
                    >
                      {onboardingLoading ? "Saving..." : "Get started"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}