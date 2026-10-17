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
  padding: "10px 12px",
  fontSize: "14px",
  color: "#3a3020",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return (
    <main style={{
      minHeight: "100svh",
      backgroundImage: "url('/inner-bg.webp')",
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
      backgroundImage: "url('/inner-bg.webp')",
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

      {/* Holding page content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ ...glassCard, padding: "36px 28px", maxWidth: "360px", width: "100%" }}>

          <div style={{ fontSize: "32px", marginBottom: "16px" }}>🐾</div>

          <h2 style={{ color: "#8a6a28", fontSize: "18px", fontWeight: 600, marginBottom: "10px", lineHeight: 1.3 }}>
            We're simplifying things
          </h2>

          <p style={{ color: "#9a8060", fontSize: "13px", lineHeight: 1.7, marginBottom: "8px" }}>
            Our tracking system got a little complicated, and we're rebuilding it to be cleaner and easier for you.
          </p>

          <p style={{ color: "#b09a70", fontSize: "12px", lineHeight: 1.6 }}>
            Your account and balance are safe. The portal will be back soon with a much better experience.
          </p>

          <div style={{ marginTop: "24px", height: "1px", backgroundColor: "rgba(180,150,90,0.2)" }} />

          <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "16px", letterSpacing: "0.05em" }}>
            Questions?{" "}
            <a
              href="https://wa.me/917043759777"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#8a6a28", textDecoration: "none" }}
            >
              Chat with us on WhatsApp
            </a>
          </p>

        </div>
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