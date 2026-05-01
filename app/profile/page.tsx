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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password form
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
      .then((res) => {
        if (res.status === 401) { router.push("/"); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
        }
      })
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

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

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
          onClick={() => router.push(user?.is_admin ? "/admin" : "/dashboard")}
          style={{ background: "none", border: "none", color: "#6a5f52", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
        >
          ←
        </button>
        <div>
          <h1 style={{ color: "#e8e0d0", fontSize: "16px", fontWeight: 600 }}>Profile</h1>
          <p style={{ color: "#6a5f52", fontSize: "11px", marginTop: "1px" }}>{user?.email}</p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Profile details */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Personal details</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {profileError && <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>{profileError}</p>}
            {profileSuccess && <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px" }}>{profileSuccess}</p>}

            <button
              type="submit"
              disabled={profileLoading}
              style={{ backgroundColor: profileLoading ? "#8a6f3a" : "#c9a84c", color: "#1a1612", fontWeight: 600, fontSize: "13px", borderRadius: "8px", padding: "10px", border: "none", cursor: "pointer", width: "100%" }}
            >
              {profileLoading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Change password</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", color: "#a09080" }}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {passwordError && <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px" }}>{passwordSuccess}</p>}

            <button
              type="submit"
              disabled={passwordLoading}
              style={{ backgroundColor: "transparent", color: "#c9a84c", fontWeight: 600, fontSize: "13px", borderRadius: "8px", padding: "10px", border: "1px solid #c9a84c", cursor: "pointer", width: "100%", opacity: passwordLoading ? 0.5 : 1 }}
            >
              {passwordLoading ? "Updating..." : "Change password"}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}