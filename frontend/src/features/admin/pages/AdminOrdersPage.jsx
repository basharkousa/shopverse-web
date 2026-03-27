import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOrdersThunk,
    updateAdminOrderStatusThunk,
    clearAdminOrderRowError,
    selectAdminOrders,
    selectAdminOrdersStatus,
    selectAdminOrdersError,
    selectAdminOrderUpdateStatusById,
    selectAdminOrderUpdateErrorById,
} from "../adminOrdersSlice";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "cancelled"];

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

export default function AdminOrdersPage() {
    const dispatch = useDispatch();
    const orders = useSelector(selectAdminOrders);
    const status = useSelector(selectAdminOrdersStatus);
    const error = useSelector(selectAdminOrdersError);
    const updateStatusById = useSelector(selectAdminOrderUpdateStatusById);
    const updateErrorById = useSelector(selectAdminOrderUpdateErrorById);

    const [draftStatuses, setDraftStatuses] = useState({});
    const [rowSuccessMap, setRowSuccessMap] = useState({});

    useEffect(() => {
        dispatch(fetchAdminOrdersThunk());
    }, [dispatch]);

    useEffect(() => {
        const nextDrafts = {};
        orders.forEach((order) => {
            nextDrafts[order.id] = draftStatuses[order.id] || order.status;
        });
        setDraftStatuses(nextDrafts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders]);

    const hasOrders = useMemo(() => orders.length > 0, [orders]);

    function handleDraftChange(orderId, value) {
        setDraftStatuses((prev) => ({ ...prev, [orderId]: value }));
        dispatch(clearAdminOrderRowError(orderId));
        setRowSuccessMap((prev) => ({ ...prev, [orderId]: "" }));
    }

    async function handleSaveStatus(order) {
        const nextStatus = draftStatuses[order.id] || order.status;
        const action = await dispatch(
            updateAdminOrderStatusThunk({ id: order.id, status: nextStatus })
        );

        if (!updateAdminOrderStatusThunk.rejected.match(action)) {
            setRowSuccessMap((prev) => ({ ...prev, [order.id]: "Saved" }));
            window.setTimeout(() => {
                setRowSuccessMap((prev) => ({ ...prev, [order.id]: "" }));
            }, 1800);
        }
    }

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h1 style={{ margin: 0 }}>Orders</h1>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Track customer orders and update their current status.
                        </p>
                    </div>

                    <button className="btn" onClick={() => dispatch(fetchAdminOrdersThunk())}>
                        Refresh
                    </button>
                </div>

                {status === "loading" && <p className="muted">Loading orders...</p>}
                {status === "failed" && <div className="admin-alert admin-alert--error">{error}</div>}

                {status === "succeeded" && !hasOrders && (
                    <div className="card" style={{ textAlign: "center", boxShadow: "none" }}>
                        <div style={{ fontWeight: 800 }}>No orders found</div>
                        <div className="muted" style={{ marginTop: 6 }}>
                            Customer orders will appear here once checkout is completed.
                        </div>
                    </div>
                )}

                {status === "succeeded" && hasOrders && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Update Status</th>
                                <th></th>
                            </tr>
                            </thead>

                            <tbody>
                            {orders.map((order) => {
                                const currentDraft = draftStatuses[order.id] || order.status;
                                const isSaving = updateStatusById[order.id] === "loading";
                                const rowError = updateErrorById[order.id];
                                const rowSuccess = rowSuccessMap[order.id];
                                const isChanged = currentDraft !== order.status;

                                return (
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
                                            <div className="admin-order-status-cell">
                                                <select
                                                    value={currentDraft}
                                                    onChange={(e) => handleDraftChange(order.id, e.target.value)}
                                                    disabled={isSaving}
                                                >
                                                    {STATUS_OPTIONS.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    className="btn"
                                                    onClick={() => handleSaveStatus(order)}
                                                    disabled={isSaving || !isChanged}
                                                >
                                                    {isSaving ? "Saving..." : "Save"}
                                                </button>

                                                {rowSuccess && (
                                                    <div className="admin-inline-note admin-inline-note--success">
                                                        {rowSuccess}
                                                    </div>
                                                )}

                                                {rowError && (
                                                    <div className="admin-inline-note admin-inline-note--error">
                                                        {rowError}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Link to={`/admin/orders/${order.id}`} className="btn">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}