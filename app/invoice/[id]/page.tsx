"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface InvoiceEntry {
  id: number;
  date: string;
  description: string;
  mode: string | null;
  transaction_id: string | null;
  credit: string | null;
  debit: string | null;
  balance: string;
}

interface InvoiceData {
  user: { id: number; name: string; phone: string };
  period: { from: string; to: string };
  opening_balance: string;
  closing_balance: string;
  total_credits: string;
  total_debits: string;
  entries: InvoiceEntry[];
}

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatAmount(val: string | null) {
  if (!val) return "—";
  return "₹" + parseFloat(val).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const glassCard = {
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.7)",
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(160,130,80,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
} as React.CSSProperties;

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const defaultRange = getMonthRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchInvoice() {
    setLoading(true); setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoice/${userId}?from_date=${fromDate}&to_date=${toDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) { router.push("/"); return; }
      if (res.status === 429) { setError("Too many requests. Please wait a moment."); return; }
      if (!res.ok) { const d = await res.json(); setError(d.detail || "Failed to load statement"); return; }
      const data = await res.json();
      setInvoice(data);
      setInvoiceNumber(crypto.randomUUID());
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const originalTitle = document.title;
    const dateStr = invoice?.period.from.replace(/-/g, "") ?? "";
    const nameStr = invoice?.user.name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") ?? "";
    document.title = `${dateStr}_${nameStr}_${invoiceNumber}`;
    window.print();
    document.title = originalTitle;
  }

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    fetchInvoice();
  }, []);

  // Document styles — keep dark/formal for printing
  const s = {
    doc: { backgroundColor: "#1e1a14", border: "1px solid #3a3020", borderRadius: "10px", overflow: "hidden" } as React.CSSProperties,
    header: { padding: "28px 28px 20px", borderBottom: "1px solid #3a3020" } as React.CSSProperties,
    brand: { fontSize: "22px", fontWeight: 700, color: "#c9a84c", letterSpacing: "0.08em", textTransform: "uppercase" as const } as React.CSSProperties,
    brandSub: { fontSize: "11px", color: "#6a5f52", letterSpacing: "0.1em", marginTop: "2px" } as React.CSSProperties,
    invoiceTitle: { fontSize: "12px", color: "#6a5f52", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: "20px" } as React.CSSProperties,
    periodText: { fontSize: "15px", color: "#c2b89a", marginTop: "4px" } as React.CSSProperties,
    metaRow: { display: "flex", gap: "0", borderBottom: "1px solid #3a3020", flexWrap: "wrap" } as React.CSSProperties,
    metaBlock: { padding: "18px 28px", flex: "1", minWidth: "140px" } as React.CSSProperties,
    metaLabel: { fontSize: "10px", color: "#6a5f52", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "4px" } as React.CSSProperties,
    metaValue: { fontSize: "14px", color: "#c2b89a" } as React.CSSProperties,
    metaDivider: { width: "1px", backgroundColor: "#3a3020" } as React.CSSProperties,
    summaryRow: { display: "flex", borderBottom: "1px solid #3a3020", flexWrap: "wrap" } as React.CSSProperties,
    summaryCard: { flex: "1", padding: "16px 28px", minWidth: "120px", borderRight: "1px solid #3a3020" } as React.CSSProperties,
    summaryLabel: { fontSize: "10px", color: "#6a5f52", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "6px" } as React.CSSProperties,
    tableWrap: { overflowX: "auto" } as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" } as React.CSSProperties,
    th: { padding: "12px 16px", textAlign: "left" as const, fontSize: "10px", letterSpacing: "0.1em", color: "#6a5f52", textTransform: "uppercase" as const, borderBottom: "1px solid #3a3020", backgroundColor: "#1a1612", whiteSpace: "nowrap" as const } as React.CSSProperties,
    thRight: { padding: "12px 16px", textAlign: "right" as const, fontSize: "10px", letterSpacing: "0.1em", color: "#6a5f52", textTransform: "uppercase" as const, borderBottom: "1px solid #3a3020", backgroundColor: "#1a1612", whiteSpace: "nowrap" as const } as React.CSSProperties,
    td: { padding: "14px 16px", borderBottom: "1px solid #2a2218", color: "#c2b89a", verticalAlign: "top" as const } as React.CSSProperties,
    tdRight: { padding: "14px 16px", borderBottom: "1px solid #2a2218", color: "#c2b89a", textAlign: "right" as const, verticalAlign: "top" as const, whiteSpace: "nowrap" as const } as React.CSSProperties,
    tdCredit: { padding: "14px 16px", borderBottom: "1px solid #2a2218", color: "#4a9a6a", textAlign: "right" as const, verticalAlign: "top" as const, whiteSpace: "nowrap" as const, fontWeight: 600 } as React.CSSProperties,
    tdDebit: { padding: "14px 16px", borderBottom: "1px solid #2a2218", color: "#c9a84c", textAlign: "right" as const, verticalAlign: "top" as const, whiteSpace: "nowrap" as const, fontWeight: 600 } as React.CSSProperties,
    tdBalance: { padding: "14px 16px", borderBottom: "1px solid #2a2218", textAlign: "right" as const, verticalAlign: "top" as const, whiteSpace: "nowrap" as const, fontWeight: 600 } as React.CSSProperties,
    openingRow: { backgroundColor: "#221e18" } as React.CSSProperties,
    footer: { padding: "20px 28px", borderTop: "1px solid #3a3020" } as React.CSSProperties,
    footerText: { fontSize: "11px", color: "#4a3f30", letterSpacing: "0.05em" } as React.CSSProperties,
  };

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          main { background: white !important; background-image: none !important; }
          .no-print { display: none !important; }
          .print-doc { border: none !important; background: white !important; color: black !important; }
          .print-doc * { color: black !important; background: transparent !important; border-color: #ccc !important; }
          .print-doc .credit-cell { color: #1a7a4a !important; }
          .print-doc .debit-cell { color: #a05000 !important; }
          .print-doc .balance-positive { color: #1a7a4a !important; }
          .print-doc .balance-negative { color: #a00000 !important; }
        }
      `}</style>

      <main style={{
        minHeight: "100svh",
        backgroundImage: "url('/inner-bg.webp')",
        backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        fontFamily: "'Georgia', serif",
      }}>

        {/* Overlay */}
        <div className="no-print" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.4)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 16px 60px", position: "relative", zIndex: 1 }}>

          {/* Controls */}
          <div className="no-print">

            {/* Header bar */}
            <div style={{
              ...glassCard,
              borderRadius: "12px",
              padding: "14px 20px",
              display: "flex", alignItems: "center", gap: "12px",
              marginBottom: "20px",
            }}>
              <button
                onClick={() => router.back()}
                style={{ background: "none", border: "none", color: "#9a8060", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
              >
                ←
              </button>
              <div>
                <h1 style={{ color: "#3a3020", fontSize: "16px", fontWeight: 600, margin: 0 }}>Account Statement</h1>
                <p style={{ color: "#b09a70", fontSize: "11px", marginTop: "1px" }}>{invoice?.user.name || "Loading..."}</p>
              </div>
            </div>

            {/* Date range + buttons */}
            <div style={{
              ...glassCard,
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap",
              marginBottom: "20px",
            }}>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#b09a70", textTransform: "uppercase", marginBottom: "6px" }}>From</div>
                <input
                  type="date" value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,150,90,0.25)",
                    borderRadius: "6px", color: "#8a6a28", padding: "8px 12px", fontSize: "13px",
                    outline: "none", width: "140px",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "#b09a70", textTransform: "uppercase", marginBottom: "6px" }}>To</div>
                <input
                  type="date" value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.6)", border: "1px solid rgba(180,150,90,0.25)",
                    borderRadius: "6px", color: "#8a6a28", padding: "8px 12px", fontSize: "13px",
                    outline: "none", width: "140px",
                  }}
                />
              </div>
              <button
                onClick={fetchInvoice} disabled={loading}
                style={{
                  background: "rgba(201,168,76,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(201,168,76,0.4)", color: "#5a3e10",
                  borderRadius: "6px", padding: "9px 20px", fontSize: "13px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.03em",
                }}
              >
                {loading ? "Loading..." : "Generate"}
              </button>
              {invoice && (
                <button
                  onClick={handlePrint}
                  style={{
                    background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(201,168,76,0.35)", color: "#8a6a28",
                    borderRadius: "6px", padding: "9px 18px", fontSize: "13px",
                    cursor: "pointer", letterSpacing: "0.03em",
                  }}
                >
                  Print / Save PDF
                </button>
              )}
            </div>

            {error && (
              <div style={{ color: "#c0392b", fontSize: "13px", marginBottom: "16px" }}>{error}</div>
            )}
          </div>

          {/* Invoice document — kept dark/formal intentionally */}
          {invoice && (
            <div style={s.doc} className="print-doc">

              <div style={s.header}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <img src="/logo.png" alt="Kmcho" style={{ height: 36, marginBottom: 8 }} />
                    <div style={s.brand}>Kmcho</div>
                    <div style={s.brandSub}>Canine Kitchen · my.kmcho.co.in</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={s.invoiceTitle}>Account Statement</div>
                    <div style={s.periodText}>
                      {formatDate(invoice.period.from + "T00:00:00")} — {formatDate(invoice.period.to + "T00:00:00")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6a5f52", marginTop: "4px", letterSpacing: "0.05em" }}>
                      Invoice #{invoiceNumber}
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.metaRow}>
                <div style={s.metaBlock}>
                  <div style={s.metaLabel}>Customer</div>
                  <div style={{ ...s.metaValue, fontSize: "16px", color: "#e8dcc8" }}>{invoice.user.name}</div>
                  <div style={{ ...s.metaValue, fontSize: "12px", marginTop: "2px" }}>{invoice.user.phone}</div>
                </div>
                <div style={s.metaDivider} />
                <div style={s.metaBlock}>
                  <div style={s.metaLabel}>Opening Balance</div>
                  <div style={{ ...s.metaValue, fontSize: "16px" }}>{formatAmount(invoice.opening_balance)}</div>
                </div>
                <div style={s.metaDivider} />
                <div style={s.metaBlock}>
                  <div style={s.metaLabel}>Closing Balance</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: parseFloat(invoice.closing_balance) < 0 ? "#c94a4a" : "#4a9a6a" }}>
                    {formatAmount(invoice.closing_balance)}
                  </div>
                </div>
              </div>

              <div style={s.summaryRow}>
                <div style={s.summaryCard}>
                  <div style={s.summaryLabel}>Total Credits</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#4a9a6a" }}>{formatAmount(invoice.total_credits)}</div>
                </div>
                <div style={s.summaryCard}>
                  <div style={s.summaryLabel}>Total Debits</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#c9a84c" }}>{formatAmount(invoice.total_debits)}</div>
                </div>
                <div style={{ ...s.summaryCard, borderRight: "none" }}>
                  <div style={s.summaryLabel}>Transactions</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#c2b89a" }}>{invoice.entries.length}</div>
                </div>
              </div>

              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Date & Time</th>
                      <th style={s.th}>Description</th>
                      <th style={s.th}>Mode</th>
                      <th style={s.thRight}>Credit</th>
                      <th style={s.thRight}>Debit</th>
                      <th style={s.thRight}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={s.openingRow}>
                      <td style={s.td} colSpan={5}>
                        <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6a5f52" }}>
                          Opening Balance
                        </span>
                      </td>
                      <td style={{ ...s.tdBalance, color: "#c2b89a" }}>{formatAmount(invoice.opening_balance)}</td>
                    </tr>

                    {invoice.entries.map((entry) => {
                      const bal = parseFloat(entry.balance);
                      return (
                        <tr key={entry.id}>
                          <td style={s.td}>
                            <div>{formatDate(entry.date)}</div>
                            <div style={{ fontSize: "11px", color: "#6a5f52", marginTop: "2px" }}>{formatTime(entry.date)}</div>
                          </td>
                          <td style={s.td}>
                            <div>{entry.description}</div>
                            {entry.transaction_id && (
                              <div style={{ fontSize: "11px", color: "#6a5f52", marginTop: "2px" }}>Ref: {entry.transaction_id}</div>
                            )}
                          </td>
                          <td style={{ ...s.td, fontSize: "12px", color: "#6a5f52" }}>{entry.mode || "—"}</td>
                          <td className="credit-cell" style={entry.credit ? s.tdCredit : s.tdRight}>{formatAmount(entry.credit)}</td>
                          <td className="debit-cell" style={entry.debit ? s.tdDebit : s.tdRight}>{formatAmount(entry.debit)}</td>
                          <td
                            className={bal < 0 ? "balance-negative" : "balance-positive"}
                            style={{ ...s.tdBalance, color: bal < 0 ? "#c94a4a" : "#c2b89a" }}
                          >
                            {formatAmount(entry.balance)}
                          </td>
                        </tr>
                      );
                    })}

                    <tr style={{ ...s.openingRow, borderTop: "1px solid #3a3020" }}>
                      <td style={s.td} colSpan={5}>
                        <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6a5f52" }}>
                          Closing Balance
                        </span>
                      </td>
                      <td style={{ ...s.tdBalance, color: parseFloat(invoice.closing_balance) < 0 ? "#c94a4a" : "#4a9a6a", fontSize: "15px" }}>
                        {formatAmount(invoice.closing_balance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={s.footer}>
                <div style={s.footerText}>
                  Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} · Kmcho Canine Kitchen · This is a system-generated statement · Invoice #{invoiceNumber}
                </div>
              </div>

            </div>
          )}

          {!invoice && !loading && !error && (
            <div style={{ textAlign: "center", color: "#b09a70", padding: "60px 0", fontSize: "14px" }}>
              Select a date range and tap Generate
            </div>
          )}

        </div>
      </main>
    </>
  );
}