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
  is_admin: boolean;
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (res.status === 401) { router.push("/"); return null; } return res.json(); })
      .then((data) => { if (data) { setUser(data); setName(data.name || ""); setPhone(data.phone || ""); setEmail(data.email || ""); } })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    setProfileLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileError(data.detail || "Failed to update"); return; }
      setUser(data);
      setProfileSuccess("Profile updated successfully");
    } catch {
      setProfileError("Could not connect to server");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPasswordError(data.detail || "Failed to update password"); return; }
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      setPasswordError("Could not connect to server");
    } finally {
      setPasswordLoading(false);
    }
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
          onClick={() => router.push(user?.is_admin ? "/admin" : "/dashboard")}
          style={{ background: "none", border: "none", color: "#9a8060", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600 }}>Profile</h1>
          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>{user?.email}</p>
        </div>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

        {/* Personal details */}
        <div style={{ ...glassCard, padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Personal details</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            {profileError && <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>{profileError}</p>}
            {profileSuccess && <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px" }}>{profileSuccess}</p>}

            <button
              type="submit" disabled={profileLoading}
              style={{
                background: profileLoading ? "rgba(180,150,80,0.5)" : "rgba(201,168,76,0.85)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#5a3e10", fontWeight: 600, fontSize: "13px",
                borderRadius: "8px", padding: "10px",
                cursor: profileLoading ? "not-allowed" : "pointer", width: "100%",
              }}
            >
              {profileLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div style={{ ...glassCard, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase" }}>Change password</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                required placeholder="••••••••"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                required placeholder="Min 6 characters"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060" }}>Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required placeholder="Repeat new password"
                style={glassInput}
                onFocus={(e) => e.target.style.borderColor = "rgba(180,140,60,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(180,150,90,0.25)"} />
            </div>

            {passwordError && <p style={{ fontSize: "12px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "6px", padding: "8px 12px" }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ fontSize: "12px", color: "#2e7d32", background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.2)", borderRadius: "6px", padding: "8px 12px" }}>{passwordSuccess}</p>}

            <button
              type="submit" disabled={passwordLoading}
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#8a6a28", fontWeight: 600, fontSize: "13px",
                borderRadius: "8px", padding: "10px",
                cursor: passwordLoading ? "not-allowed" : "pointer", width: "100%",
                opacity: passwordLoading ? 0.5 : 1,
              }}
            >
              {passwordLoading ? "Updating..." : "Change password"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}