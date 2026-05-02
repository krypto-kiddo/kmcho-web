"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);

      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const me = await meRes.json();

      if (me.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100svh", backgroundColor: "#1a1612", padding: "0 20px" }} className="flex flex-col items-center justify-center">
      <div className="w-full" style={{ maxWidth: "360px" }}>

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 style={{ color: "#c9a84c", fontSize: "26px", fontWeight: 600, letterSpacing: "0.02em" }}>
            KMછો Canine
          </h1>
          <p style={{ color: "#6a5f52", fontSize: "10px", letterSpacing: "0.18em", marginTop: "6px" }} className="uppercase">
            Cloud kitchen for dogs · Ahmedabad
          </p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "28px" }}>

          {/* Section label */}
          <div className="flex items-center gap-3" style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>
              Sign in
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col" style={{ gap: "16px" }}>

            {/* Email */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#a09080", letterSpacing: "0.05em" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  backgroundColor: "#2a2420",
                  border: "1px solid #3a3020",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#e8e0d0",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#a09080", letterSpacing: "0.05em" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  backgroundColor: "#2a2420",
                  border: "1px solid #3a3020",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#e8e0d0",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                onBlur={(e) => e.target.style.borderColor = "#3a3020"}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#c9a84c", width: "14px", height: "14px", cursor: "pointer" }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "12px", color: "#a09080", cursor: "pointer" }}>
                Remember me
              </label>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontSize: "12px",
                color: "#c47a7a",
                backgroundColor: "#2e1414",
                border: "1px solid #5a2a2a",
                borderRadius: "6px",
                padding: "8px 12px",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                backgroundColor: loading ? "#8a6f3a" : "#c9a84c",
                color: "#1a1612",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                padding: "11px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
                width: "100%",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#e2c97e" }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#c9a84c" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "#6a5f52", marginTop: "24px" }}>
          my.kmcho.co.in · Ledger portal
        </p>

      </div>
    </main>
  );
}