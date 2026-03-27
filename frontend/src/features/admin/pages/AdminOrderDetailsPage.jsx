import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOrderDetailsThunk,
    updateAdminOrderStatusThunk,
    clearAdminOrderRowError,
    clearSelectedAdminOrder,
    selectSelectedAdminOrder,
    selectSelectedAdminOrderStatus,
    selectSelectedAdminOrderError,
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

export default function AdminOrderDetailsPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const order = useSelector(selectSelectedAdminOrder);
    const status = useSelector(selectSelectedAdminOrderStatus);
    const error = useSelector(selectSelectedAdminOrderError);
    const updateStatusById = useSelector(selectAdminOrderUpdateStatusById);
    const updateErrorById = useSelector(selectAdminOrderUpdateErrorById);

    const [draftStatus, setDraftStatus] = useState("");
    const [saveNote, setSaveNote] = useState("");

    useEffect(() => {
        dispatch(fetchAdminOrderDetailsThunk(id));

        return () => {
            dispatch(clearSelectedAdminOrder());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (order?.status) {
            setDraftStatus(order.status);
        }
    }, [order?.status]);

    const isSaving = useMemo(
        () => updateStatusById[Number(id)] === "loading" || updateStatusById[id] === "loading",
        [updateStatusById, id]
    );

    const rowError = updateErrorById[Number(id)] || updateErrorById[id] || "";
    const isChanged = order ? draftStatus !== order.status : false;

    async function onSaveStatus() {
        if (!order) return;

        const action = await dispatch(
            updateAdminOrderStatusThunk({
                id: order.id,
                status: draftStatus,
            })
        );

        if (!updateAdminOrderStatusThunk.rejected.match(action)) {
            setSaveNote("Status updated successfully");
            window.setTimeout(() => setSaveNote(""), 1800);
        }
    }

    function onDraftChange(value) {
        setDraftStatus(value);
        dispatch(clearAdminOrderRowError(Number(id)));
        dispatch(clearAdminOrderRowError(id));
        setSaveNote("");
    }

    if (status === "loading") {
        return (
            <div className="card">
                <p className="muted" style={{ margin: 0 }}>
                    Loading order details...
                </p>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="card">
                <div className="admin-alert admin-alert--error">{error}</div>
                <div style={{ marginTop: 12 }}>
                    <Link to="/admin/orders" className="btn">
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="card">
                <p className="muted" style={{ margin: 0 }}>
                    Order not found.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h1 style={{ margin: 0 }}>Order #{order.id}</h1>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Created on {formatDate(order.created_at)}
                        </p>
                    </div>

                    <Link to="/admin/orders" className="btn">
                        Back to Orders
                    </Link>
                </div>

                <div className="grid-3">
                    <div className="card admin-summary-card">
                        <div className="admin-summary-card__label">Order Total</div>
                        <div className="admin-summary-card__value">
                            {formatMoney(order.total_cents)}
                        </div>
                    </div>

                    <div className="card admin-summary-card">
                        <div className="admin-summary-card__label">Current Status</div>
                        <div style={{ marginTop: 8 }}>
                            <span className={statusLabelClass(order.status)}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="card admin-summary-card">
                        <div className="admin-summary-card__label">Items</div>
                        <div className="admin-summary-card__value">
                            {Array.isArray(order.items) ? order.items.length : 0}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid-2 admin-details-grid">
                <div className="card">
                    <h2 style={{ marginTop: 0 }}>Customer</h2>
                    <div className="admin-detail-list">
                        <div>
                            <span className="admin-detail-list__label">Name</span>
                            <strong>{order.customer?.name || "-"}</strong>
                        </div>
                        <div>
                            <span className="admin-detail-list__label">Email</span>
                            <strong>{order.customer?.email || "-"}</strong>
                        </div>
                        <div>
                            <span className="admin-detail-list__label">Customer ID</span>
                            <strong>{order.customer?.id || "-"}</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 style={{ marginTop: 0 }}>Shipping</h2>
                    <div className="admin-detail-list">
                        <div>
                            <span className="admin-detail-list__label">Name</span>
                            <strong>{order.shipping?.name || "-"}</strong>
                        </div>
                        <div>
                            <span className="admin-detail-list__label">City</span>
                            <strong>{order.shipping?.city || "-"}</strong>
                        </div>
                        <div>
                            <span className="admin-detail-list__label">Address</span>
                            <strong>{order.shipping?.address || "-"}</strong>
                        </div>
                        <div>
                            <span className="admin-detail-list__label">Phone</span>
                            <strong>{order.shipping?.phone || "-"}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h2 style={{ margin: 0 }}>Update Status</h2>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Change the current order status and save it.
                        </p>
                    </div>
                </div>

                <div className="admin-order-update-panel">
                    <select
                        value={draftStatus}
                        onChange={(e) => onDraftChange(e.target.value)}
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
                        onClick={onSaveStatus}
                        disabled={isSaving || !isChanged}
                    >
                        {isSaving ? "Saving..." : "Save Status"}
                    </button>
                </div>

                {saveNote && (
                    <div className="admin-inline-note admin-inline-note--success" style={{ marginTop: 10 }}>
                        {saveNote}
                    </div>
                )}

                {rowError && (
                    <div className="admin-inline-note admin-inline-note--error" style={{ marginTop: 10 }}>
                        {rowError}
                    </div>
                )}
            </section>

            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h2 style={{ margin: 0 }}>Order Items</h2>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Products included in this order.
                        </p>
                    </div>
                </div>

                {!order.items || order.items.length === 0 ? (
                    <p className="muted" style={{ marginBottom: 0 }}>
                        No items found for this order.
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Product</th>
                                <th>Product ID</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th>Line Total</th>
                            </tr>
                            </thead>

                            <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="admin-product-cell">
                                            <div className="admin-product-thumb">
                                                {item.product_image_url ? (
                                                    <img
                                                        src={item.product_image_url}
                                                        alt={item.product_title}
                                                        className="admin-product-thumb__img"
                                                    />
                                                ) : (
                                                    <div className="admin-product-thumb__placeholder">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div style={{ fontWeight: 800 }}>
                                                    {item.product_title || "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>#{item.product_id}</td>
                                    <td>{formatMoney(item.unit_price_cents)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatMoney(item.line_total_cents)}</td>
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