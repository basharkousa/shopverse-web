import { useSelector } from "react-redux";

function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export default function ProfilePage() {
    const user = useSelector((s) => s.auth.user);

    // Placeholder for Sprint Orders (later you'll fetch real orders)
    const orders = []; // e.g. [{ id, date, total, status }]

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ display: "grid", gap: 16 }}>
                {/* Profile info */}
                <div className="card">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <h2 style={{ margin: 0 }}>My Profile</h2>
                            <p className="muted" style={{ marginTop: 6 }}>
                                Manage your account and view your orders.
                            </p>
                        </div>

                        {/* Optional for now */}
                        <button className="btn" type="button" disabled>
                            Edit Profile (Coming Soon)
                        </button>
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div>
                            <div className="muted" style={{ fontSize: 13 }}>
                                Full Name
                            </div>
                            <div style={{ fontWeight: 700 }}>{user?.full_name || "-"}</div>
                        </div>

                        <div>
                            <div className="muted" style={{ fontSize: 13 }}>
                                Email
                            </div>
                            <div style={{ fontWeight: 700 }}>{user?.email || "-"}</div>
                        </div>

                        <div>
                            <div className="muted" style={{ fontSize: 13 }}>
                                Role
                            </div>
                            <div style={{ fontWeight: 700 }}>{user?.role || "-"}</div>
                        </div>

                        <div>
                            <div className="muted" style={{ fontSize: 13 }}>
                                Registered
                            </div>
                            <div style={{ fontWeight: 700 }}>
                                {formatDate(user?.created_at)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="card">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>My Orders</h3>
                        <div className="muted" style={{ fontSize: 14 }}>
                            Track order status (Pending / Paid / Shipped / Cancelled)
                        </div>
                    </div>

                    <div style={{ marginTop: 12, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ textAlign: "left" }}>
                                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                                    Order ID
                                </th>
                                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                                    Date
                                </th>
                                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                                    Total
                                </th>
                                <th style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>
                                    Status
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: 16 }} className="muted">
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => (
                                    <tr key={o.id}>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                                            #{o.id}
                                        </td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                                            {formatDate(o.date)}
                                        </td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                                            €{(o.totalCents / 100).toFixed(2)}
                                        </td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                                            <StatusTag status={o.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusTag({ status }) {
    const s = String(status || "").toLowerCase();

    // simple color tags (guide style)
    let bg = "#f2f2f2";
    let color = "#333";

    if (s === "paid") {
        bg = "#e7f5ff";
        color = "#0b7285";
    } else if (s === "shipped") {
        bg = "#ebfbee";
        color = "#2b8a3e";
    } else if (s === "cancelled") {
        bg = "#fff5f5";
        color = "#c92a2a";
    } else if (s === "pending") {
        bg = "#fff9db";
        color = "#a07900";
    }

    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 999,
                background: bg,
                color,
                fontWeight: 700,
                fontSize: 12,
            }}
        >
      {(status || "Pending").toString()}
    </span>
    );
}