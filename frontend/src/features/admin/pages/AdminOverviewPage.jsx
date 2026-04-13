import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOverviewThunk,
    selectAdminOverviewData,
    selectAdminOverviewError,
    selectAdminOverviewStatus,
} from "../adminOverviewSlice";
import { formatMoney } from "../../../utils/formatMoney";
import StateMessage from "../../../components/StateMessage.jsx";

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "status-pill status-pill--paid";
    if (value === "shipped") return "status-pill status-pill--shipped";
    if (value === "cancelled") return "status-pill status-pill--cancelled";
    return "status-pill status-pill--pending";
}

export default function AdminOverviewPage() {
    const dispatch = useDispatch();

    const status = useSelector(selectAdminOverviewStatus);
    const error = useSelector(selectAdminOverviewError);
    const data = useSelector(selectAdminOverviewData);

    useEffect(() => {
        dispatch(fetchAdminOverviewThunk());
    }, [dispatch]);

    if (status === "loading") {
        return (
            <StateMessage
                type="info"
                title="Loading dashboard"
                message="Please wait while we prepare the latest store overview."
            />
        );
    }

    if (status === "failed") {
        return (
            <StateMessage
                type="error"
                title="Could not load dashboard"
                message={error || "Something went wrong while loading the admin overview."}
                action={
                    <button
                        className="btn btn-primary"
                        onClick={() => dispatch(fetchAdminOverviewThunk())}
                    >
                        Retry
                    </button>
                }
            />
        );
    }

    const stats = data?.stats || {};
    const recentOrders = data?.recentOrders || [];

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <section
                className="admin-stat-grid-3"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 16,
                }}
            >
                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Products</div>
                    <div className="admin-stat-card__value">{stats.totalProducts || 0}</div>
                    <div className="muted admin-stat-card__hint">
                        Products currently listed in the catalog
                    </div>
                </div>

                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Orders</div>
                    <div className="admin-stat-card__value">{stats.totalOrders || 0}</div>
                    <div className="muted admin-stat-card__hint">
                        Orders placed across the store
                    </div>
                </div>

                <div className="card admin-stat-card">
                    <div className="admin-stat-card__label">Total Sales</div>
                    <div className="admin-stat-card__value">
                        {formatMoney(stats.totalSalesCents || 0)}
                    </div>
                    <div className="muted admin-stat-card__hint">
                        Approximate completed sales value
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h3 style={{ margin: 0 }}>Quick Actions</h3>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Jump directly to the most common admin tasks.
                        </p>
                    </div>

                    <div className="admin-quick-actions">
                        <Link
                            to="/admin/products"
                            className="btn btn-primary"
                            style={{ textDecoration: "none" }}
                        >
                            Manage Products
                        </Link>

                        <Link
                            to="/admin/orders"
                            className="btn"
                            style={{ textDecoration: "none" }}
                        >
                            View Orders
                        </Link>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h3 style={{ margin: 0 }}>Recent Orders</h3>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Latest customer activity in your store.
                        </p>
                    </div>
                </div>

                {recentOrders.length === 0 ? (
                    <StateMessage
                        type="empty"
                        compact
                        title="No recent orders"
                        message="Recent order activity will appear here once customers start placing orders."
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                            </thead>

                            <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.customer_name || order.email || "—"}</td>
                                    <td>
                                        {order.created_at
                                            ? new Date(order.created_at).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td>{formatMoney(order.total_cents || 0)}</td>
                                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status || "pending"}
                      </span>
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