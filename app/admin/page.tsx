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
    if (!token) {
      router.push("/");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data.filter((u: User) => !u.is_admin));
      })
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
    if (balance <= 0) return "#8b3a3a";
    if (balance < 500) return "#b8860b";
    return "#4a7c4a";
  }

  function balanceBg(balance: number) {
    if (balance <= 0) return "#2e1414";
    if (balance < 500) return "#2e2510";
    return "#1e2e1e";
  }

  return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", padding: "0 0 40px 0" }}>

    {/* Header */}
    <div style={{ borderBottom: "1px solid #3a3020", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <h1 style={{ color: "#c9a84c", fontSize: "18px", fontWeight: 600, letterSpacing: "0.02em" }}>
          KMછો Canine
        </h1>
        <p style={{ color: "#6a5f52", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "2px" }}>
          Admin · Ledger portal
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          style={{ fontSize: "11px", color: "#6a5f52", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
          style={{ fontSize: "11px", color: "#6a5f52", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
        >
          Sign out
        </button>
      </div>
    </div>

      <div style={{ padding: "20px" }}>

        {/* Summary card */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Overview</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#6a5f52", marginBottom: "4px" }}>Total customers</p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#e8e0d0" }}>{users.length}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#6a5f52", marginBottom: "4px" }}>Total wallet balance</p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#c9a84c" }}>₹{totalBalance.toLocaleString("en-IN")}</p>
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
            backgroundColor: "#221e18",
            border: "1px solid #3a3020",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#e8e0d0",
            outline: "none",
            marginBottom: "16px",
          }}
          onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
          onBlur={(e) => e.target.style.borderColor = "#3a3020"}
        />

        {/* Section label */}
        <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>
            Customers
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          <span style={{ fontSize: "10px", color: "#6a5f52" }}>{filtered.length}</span>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>Loading...</p>
        )}
        {error && (
          <p style={{ color: "#8b3a3a", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>{error}</p>
        )}

        {/* Customer list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/admin/${user.id}`)}
              style={{
                backgroundColor: "#221e18",
                border: "1px solid #3a3020",
                borderRadius: "10px",
                padding: "16px",
                cursor: "pointer",
                transition: "border-color 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9a84c"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#3a3020"}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#e8e0d0", marginBottom: "3px" }}>
                  {user.name}
                </p>
                <p style={{ fontSize: "11px", color: "#6a5f52" }}>
                  {user.phone || user.email || "—"}
                </p>
              </div>
              <div style={{
                backgroundColor: balanceBg(Number(user.current_balance)),
                border: `1px solid ${balanceColor(Number(user.current_balance))}33`,
                borderRadius: "8px",
                padding: "6px 12px",
                textAlign: "right",
              }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: balanceColor(Number(user.current_balance)) }}>
                  ₹{Number(user.current_balance).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p style={{ color: "#6a5f52", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
              No customers found
            </p>
          )}
        </div>

        {/* Add customer button */}
        <button
          onClick={() => router.push("/admin/new")}
          style={{
            width: "100%",
            marginTop: "20px",
            backgroundColor: "transparent",
            border: "1px dashed #3a3020",
            borderRadius: "10px",
            padding: "14px",
            color: "#6a5f52",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.color = "#c9a84c"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#3a3020"; e.currentTarget.style.color = "#6a5f52"; }}
        >
          + Add customer
        </button>

      </div>
    </main>
  );
}