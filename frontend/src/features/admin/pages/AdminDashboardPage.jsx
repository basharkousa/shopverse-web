import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../shared/api/client";

function formatMoney(cents) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format((Number(cents) || 0) / 100);
}

function formatDate(value) {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

function statusLabelClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "status-pill status-pill--paid";
    if (value === "shipped") return "status-pill status-pill--shipped";
    if (value === "cancelled") return "status-pill status-pill--cancelled";
    return "status-pill status-pill--pending";
}

export default function AdminDashboardPage() {
    const [overview, setOverview] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadOverview() {
            setStatus("loading");
            setError("");

            try {
                const res = await api.get("/admin/overview");
                if (!ignore) {
                    setOverview(res.data.overview);
                    setStatus("succeeded");
                }
            } catch (err) {
                if (!ignore) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to load admin overview"
                    );
                    setStatus("failed");
                }
            }
        }

        loadOverview();
        return () => {
            ignore = true;
        };
    }, []);

    const totals = useMemo(() => {
        return overview?.totals || {
            products: 0,
            orders: 0,
            sales_cents: 0,
        };
    }, [overview]);

    const recentOrders = overview?.recent_orders || [];

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <section className="grid-3">
                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Products</div>
                    <div className="admin-stat-card__value">
                        {status === "loading" ? "..." : totals.products}
                    </div>
                    <div className="muted admin-stat-card__hint">
                        Products currently in catalog
                    </div>
                </div>

                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Orders</div>
                    <div className="admin-stat-card__value">
                        {status === "loading" ? "..." : totals.orders}
                    </div>
                    <div className="muted admin-stat-card__hint">
                        Orders placed by customers
                    </div>
                </div>

                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Sales</div>
                    <div className="admin-stat-card__value">
                        {status === "loading" ? "..." : formatMoney(totals.sales_cents)}
                    </div>
                    <div className="muted admin-stat-card__hint">
                        Sum of all order totals
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h2 style={{ margin: 0 }}>Quick Actions</h2>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Jump directly to the main admin tasks.
                        </p>
                    </div>
                </div>

                <div className="admin-quick-actions">
                    <Link to="/admin/products" className="btn btn-primary">
                        Manage Products
                    </Link>

                    <Link to="/admin/orders" className="btn">
                        View Orders
                    </Link>
                </div>
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h2 style={{ margin: 0 }}>Recent Orders</h2>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Latest customer activity in the store.
                        </p>
                    </div>

                    <Link to="/admin/orders" className="btn">
                        See All Orders
                    </Link>
                </div>

                {status === "loading" && (
                    <p className="muted" style={{ marginBottom: 0 }}>
                        Loading overview...
                    </p>
                )}

                {status === "failed" && (
                    <div
                        style={{
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#991b1b",
                            borderRadius: 12,
                            padding: 12,
                        }}
                    >
                        {error}
                    </div>
                )}

                {status === "succeeded" && recentOrders.length === 0 && (
                    <p className="muted" style={{ marginBottom: 0 }}>
                        No orders yet.
                    </p>
                )}

                {status === "succeeded" && recentOrders.length > 0 && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                            </thead>

                            <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>
                                            {order.customer?.name || "-"}
                                        </div>
                                        <div className="muted" style={{ fontSize: 14 }}>
                                            {order.customer?.email || "-"}
                                        </div>
                                    </td>
                                    <td>{formatMoney(order.total_cents)}</td>
                                    <td>
                                            <span className={statusLabelClass(order.status)}>
                                                {order.status}
                                            </span>
                                    </td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <Link to={`/admin/orders/${order.id}`} className="btn">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}