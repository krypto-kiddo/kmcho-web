"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  current_balance: number;
  is_admin: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) { router.push("/"); return null; }
        return res.json();
      })
      .then((data) => { if (data) setUsers(data.filter((u: User) => !u.is_admin)); })
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const totalBalance = users.reduce((sum, u) => sum + Number(u.current_balance), 0);

  function balanceColor(balance: number) {
    if (balance <= 0) return "#c0392b";
    if (balance < 500) return "#b8860b";
    return "#2e7d32";
  }

  function balanceBg(balance: number) {
    if (balance <= 0) return "rgba(192,57,43,0.1)";
    if (balance < 500) return "rgba(184,134,11,0.1)";
    return "rgba(46,125,50,0.1)";
  }

  function balanceBorder(balance: number) {
    if (balance <= 0) return "rgba(192,57,43,0.25)";
    if (balance < 500) return "rgba(184,134,11,0.25)";
    return "rgba(46,125,50,0.25)";
  }

  const glassCard = {
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(160,130,80,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
  } as React.CSSProperties;

  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundImage: "url('/inner-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        padding: "0 0 40px 0",
      }}
    >
      {/* Header */}
      <div style={{
        ...glassCard,
        borderRadius: "0",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "1px solid rgba(255,255,255,0.5)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <h1 style={{ color: "#8a6a28", fontSize: "18px", fontWeight: 600, letterSpacing: "0.02em" }}>
            KMછો Canine
          </h1>
          <p style={{ color: "#b09a70", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>
            Admin · Ledger portal
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            style={{ fontSize: "11px", color: "#9a8060", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
            style={{ fontSize: "11px", color: "#9a8060", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Overview card */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "16px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Overview</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#b09a70", marginBottom: "4px" }}>Total customers</p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#3a3020" }}>{users.length}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#b09a70", marginBottom: "4px" }}>Total wallet balance</p>
              <p style={{ fontSize: "24px", fontWeight: 600, color: "#8a6a28" }}>
                ₹{totalBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#3a3020",
            outline: "none",
            marginBottom: "16px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.7)"}
        />

        {/* Section label */}
        <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>
            Customers
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          <span style={{ fontSize: "10px", color: "#b09a70" }}>{filtered.length}</span>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p style={{ color: "#9a8060", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>Loading...</p>
        )}
        {error && (
          <p style={{ color: "#c0392b", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>{error}</p>
        )}

        {/* Customer list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/admin/${user.id}`)}
              style={{
                ...glassCard,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#3a3020", marginBottom: "3px" }}>
                  {user.name}
                </p>
                <p style={{ fontSize: "11px", color: "#b09a70" }}>
                  {user.phone || user.email || "—"}
                </p>
              </div>
              <div style={{
                backgroundColor: balanceBg(Number(user.current_balance)),
                border: `1px solid ${balanceBorder(Number(user.current_balance))}`,
                borderRadius: "8px",
                padding: "6px 12px",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: balanceColor(Number(user.current_balance)) }}>
                  ₹{Number(user.current_balance).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p style={{ color: "#b09a70", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
              No customers found
            </p>
          )}
        </div>

        {/* Add customer */}
        <button
          onClick={() => router.push("/admin/new")}
          style={{
            width: "100%",
            marginTop: "20px",
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px dashed rgba(160,130,80,0.35)",
            borderRadius: "10px",
            padding: "14px",
            color: "#b09a70",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
            e.currentTarget.style.color = "#8a6a28";
            e.currentTarget.style.background = "rgba(255,255,255,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(160,130,80,0.35)";
            e.currentTarget.style.color = "#b09a70";
            e.currentTarget.style.background = "rgba(255,255,255,0.3)";
          }}
        >
          + Add customer
        </button>

      </div>
    </main>
  );
}