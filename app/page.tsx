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
    <main
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: "100svh",
        backgroundImage: "url('/login-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "0 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 65%)",
        borderRadius: "50%", top: "-100px", right: "-80px", filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(180,155,220,0.18) 0%, transparent 65%)",
        borderRadius: "50%", bottom: "-60px", left: "-60px", filter: "blur(50px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "200px", height: "200px",
        background: "radial-gradient(circle, rgba(100,180,155,0.14) 0%, transparent 65%)",
        borderRadius: "50%", bottom: "120px", right: "40px", filter: "blur(40px)", pointerEvents: "none",
      }} />

      <div className="w-full" style={{ maxWidth: "360px", position: "relative", zIndex: 1 }}>

        {/* Glass card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          borderRadius: "20px",
          padding: "36px 28px",
          boxShadow: "0 8px 32px rgba(160, 130, 80, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}>

          {/* Logo */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ color: "#8a6a28", fontSize: "26px", fontWeight: 600, letterSpacing: "0.02em", margin: 0 }}>
              KMછો Canine
            </h1>
            <p style={{ color: "#b09a70", fontSize: "10px", letterSpacing: "0.18em", marginTop: "6px", textTransform: "uppercase" }}>
              Cloud kitchen for dogs · Ahmedabad
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Sign in
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(160,130,80,0.2)" }} />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col" style={{ gap: "16px" }}>

            {/* Email */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060", letterSpacing: "0.05em" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(180, 150, 90, 0.25)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#3a3020",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.15s, background 0.15s",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(180,140,60,0.5)";
                  e.target.style.background = "rgba(255,255,255,0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(180,150,90,0.25)";
                  e.target.style.background = "rgba(255,255,255,0.6)";
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#9a8060", letterSpacing: "0.05em" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(180, 150, 90, 0.25)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  color: "#3a3020",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.15s, background 0.15s",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(180,140,60,0.5)";
                  e.target.style.background = "rgba(255,255,255,0.8)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(180,150,90,0.25)";
                  e.target.style.background = "rgba(255,255,255,0.6)";
                }}
              />
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#c9a84c", width: "14px", height: "14px", cursor: "pointer" }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "12px", color: "#9a8060", cursor: "pointer" }}>
                Remember me
              </label>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontSize: "12px",
                color: "#8b3a3a",
                background: "rgba(180, 80, 80, 0.08)",
                border: "1px solid rgba(180, 80, 80, 0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                backdropFilter: "blur(8px)",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "4px",
                background: loading
                  ? "rgba(180, 150, 80, 0.5)"
                  : "rgba(201, 168, 76, 0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201, 168, 76, 0.4)",
                color: "#5a3e10",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "10px",
                padding: "11px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                width: "100%",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "rgba(226,201,126,0.9)" }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "rgba(201,168,76,0.85)" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "#b09a70", marginTop: "20px" }}>
          my.kmcho.co.in · Ledger portal
        </p>

      </div>
    </main>
  );
}