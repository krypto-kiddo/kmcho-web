"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  children: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(201,168,76,0.35)",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 8px 32px rgba(160,130,80,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <p style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#b09a70", textTransform: "uppercase", marginBottom: "4px" }}>
          Confirm action
        </p>
        <h2 style={{ color: "#3a3020", fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}>
          {title}
        </h2>

        <div style={{
          background: "rgba(201,168,76,0.08)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          {children}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              border: "1px solid rgba(180,150,90,0.3)",
              background: "rgba(255,255,255,0.5)",
              color: "#9a8060", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              border: "1px solid rgba(201,168,76,0.4)",
              background: "rgba(201,168,76,0.85)",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              color: "#5a3e10", fontSize: "13px", fontWeight: 700, cursor: "pointer",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}