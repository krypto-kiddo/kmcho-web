    "use client";

    import { useEffect, useState } from "react";
    import { useRouter, useParams } from "next/navigation";
    import type { FormEvent } from "react";

    interface Order {
    id: number;
    user_id: number;
    status: string;
    description: string;
    order_date: string;
    created_at: string;
    amount: string | null;
    }

    interface User {
    id: number;
    name: string;
    phone: string;
    email: string;
    }

    export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [orderDate, setOrderDate] = useState("");
    
    const [newAmount, setNewAmount] = useState("");
    const [amountSaving, setAmountSaving] = useState(false);
    const [amountError, setAmountError] = useState("");
    const [amountSuccess, setAmountSuccess] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) { router.push("/"); return; }

        async function loadOrder() {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { router.push("/admin/orders"); return; }
            const data = await res.json();
            setOrder(data);
            setDescription(data.description || "");
            setStatus(data.status);
            setOrderDate(new Date(data.order_date || data.created_at).toISOString().split("T")[0]);

            const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${data.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            const userData = await userRes.json();
            setCustomer(userData);
        } catch {
            router.push("/admin/orders");
        } finally {
            setLoading(false);
        }
        }

        loadOrder();
    }, [orderId]);

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setError(""); setSuccess("");
        setSaving(true);

        try {
        // Update status if changed
        if (status !== order?.status) {
            const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status }),
            });
            if (!statusRes.ok) {
            const d = await statusRes.json();
            setError(d.detail || "Failed to update status");
            return;
            }
        }

        // Update description and date
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
            description,
            order_date: new Date(orderDate).toISOString(),
            }),
        });

        if (!updateRes.ok) {
            const d = await updateRes.json();
            setError(d.detail || "Failed to update order");
            return;
        }

        const updated = await updateRes.json();
        setOrder(updated);
        setSuccess("Order updated successfully");
        } catch {
        setError("Could not connect to server");
        } finally {
        setSaving(false);
        }
    }

    async function handleAmountUpdate() {
        setAmountError(""); setAmountSuccess("");
        if (!newAmount || parseFloat(newAmount) <= 0) {
            setAmountError("Enter a valid amount");
            return;
        }
        setAmountSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/amount`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ new_amount: parseFloat(newAmount) }),
            });
            const d = await res.json();
            if (!res.ok) { setAmountError(d.detail || "Failed to update amount"); return; }
            setAmountSuccess(`Updated: ₹${d.old_amount} → ₹${d.new_amount}`);
            setNewAmount("");
        } catch {
            setAmountError("Could not connect to server");
        } finally {
            setAmountSaving(false);
        }
    }

    function statusColor(s: string) {
        if (s === "delivered") return "#4a7c4a";
        if (s === "cancelled") return "#8b3a3a";
        return "#b8860b";
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
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#6a5f52", cursor: "pointer", fontSize: "18px", padding: "0 4px 0 0" }}
            >
            ←
            </button>
            <div>
            <h1 style={{ color: "#e8e0d0", fontSize: "16px", fontWeight: 600 }}>Order #{orderId}</h1>
            <p style={{ color: "#6a5f52", fontSize: "11px", marginTop: "1px" }}>
                {customer?.name || "Loading..."}
            </p>
            </div>
            <span style={{
            marginLeft: "auto",
            fontSize: "11px",
            fontWeight: 500,
            color: statusColor(order?.status || ""),
            backgroundColor: order?.status === "delivered" ? "#1e2e1e" : order?.status === "cancelled" ? "#2e1414" : "#2e2510",
            border: `1px solid ${statusColor(order?.status || "")}44`,
            borderRadius: "6px",
            padding: "4px 10px",
            textTransform: "capitalize",
            }}>
            {order?.status}
            </span>
        </div>

        <div style={{ padding: "20px" }}>

            {/* Customer card */}
            <div
            style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => router.push(`/admin/${customer?.id}`)}
            >
            <div>
                <p style={{ fontSize: "13px", color: "#e8e0d0", marginBottom: "3px", fontWeight: 500 }}>{customer?.name}</p>
                <p style={{ fontSize: "11px", color: "#6a5f52" }}>{customer?.phone || customer?.email || "—"}</p>
            </div>
            <span style={{ fontSize: "11px", color: "#6a5f52" }}>View →</span>
            </div>

            {/* Edit form */}
            <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" }}>Edit order</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Order date</label>
                <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                    onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Note</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Chicken + rice"
                    style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                    onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                    onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", color: "#a09080" }}>Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none", width: "100%" }}
                >
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                </div>

                {error && (
                <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px" }}>
                    {error}
                </p>
                )}
                {success && (
                <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px" }}>
                    {success}
                </p>
                )}

                <button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: saving ? "#8a6f3a" : "#c9a84c", color: "#1a1612", fontWeight: 600, fontSize: "14px", borderRadius: "8px", padding: "11px", border: "none", cursor: saving ? "not-allowed" : "pointer", width: "100%" }}
                >
                {saving ? "Saving..." : "Save changes"}
                </button>

            </form>
            </div>

            {/* Amount edit */}
            <div style={{ backgroundColor: "#221e18", border: "1px solid #3a3020", borderRadius: "12px", padding: "20px", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "0.18em", color: "#6a5f52", textTransform: "uppercase" as const }}>Order amount</span>
                    <div style={{ flex: 1, height: "1px", backgroundColor: "#3a3020" }} />
                </div>

                {order?.status === "cancelled" && (
                    <p style={{ fontSize: "11px", color: "#b8860b", backgroundColor: "#2e2510", border: "1px solid #b8860b33", borderRadius: "6px", padding: "8px 12px", marginBottom: "12px" }}>
                        This order is cancelled — updating the amount will also update the refund entry. Customer balance will not change.
                    </p>
                )}

                <p style={{ fontSize: "12px", color: "#6a5f52", marginBottom: "10px" }}>
                    Current amount: <span style={{ color: "#c2b89a" }}>
                        {order?.amount ? `₹${order.amount}` : "—"}
                    </span>
                </p>

                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="New amount (₹)"
                        min="1"
                        style={{ flex: 1, backgroundColor: "#2a2420", border: "1px solid #3a3020", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#e8e0d0", outline: "none" }}
                        onFocus={(e) => e.target.style.borderColor = "#c9a84c"}
                        onBlur={(e) => e.target.style.borderColor = "#3a3020"}
                    />
                    <button
                        type="button"
                        onClick={handleAmountUpdate}
                        disabled={amountSaving}
                        style={{ backgroundColor: amountSaving ? "#8a6f3a" : "#c9a84c", color: "#1a1612", fontWeight: 600, fontSize: "14px", borderRadius: "8px", padding: "10px 20px", border: "none", cursor: amountSaving ? "not-allowed" : "pointer", whiteSpace: "nowrap" as const }}
                    >
                        {amountSaving ? "Saving..." : "Update"}
                    </button>
                </div>

                {amountError && (
                    <p style={{ fontSize: "12px", color: "#c47a7a", backgroundColor: "#2e1414", border: "1px solid #5a2a2a", borderRadius: "6px", padding: "8px 12px", marginTop: "10px" }}>
                        {amountError}
                    </p>
                )}
                {amountSuccess && (
                    <p style={{ fontSize: "12px", color: "#4a7c4a", backgroundColor: "#1e2e1e", border: "1px solid #2a4a2a", borderRadius: "6px", padding: "8px 12px", marginTop: "10px" }}>
                        {amountSuccess}
                    </p>
                )}
            </div>
        </div>
        </main>
    );
    }