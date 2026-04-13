import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminOrdersThunk,
    selectAdminOrders,
    selectAdminOrdersError,
    selectAdminOrdersStatus,
    updateAdminOrderStatusThunk,
} from "../adminOrdersSlice";
import { formatMoney } from "../../../utils/formatMoney";
import { showToast } from "../../../store/uiSlice";
import StateMessage from "../../../components/StateMessage.jsx";

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "status-pill status-pill--paid";
    if (value === "shipped") return "status-pill status-pill--shipped";
    if (value === "cancelled") return "status-pill status-pill--cancelled";
    return "status-pill status-pill--pending";
}

export default function AdminOrdersPage() {
    const dispatch = useDispatch();

    const items = useSelector(selectAdminOrders);
    const status = useSelector(selectAdminOrdersStatus);
    const error = useSelector(selectAdminOrdersError);

    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminOrdersThunk());
    }, [dispatch]);

    async function handleStatusChange(orderId, nextStatus) {
        try {
            setUpdatingOrderId(orderId);

            await dispatch(
                updateAdminOrderStatusThunk({
                    id: orderId,
                    status: nextStatus,
                })
            ).unwrap();

            dispatch(
                showToast({
                    type: "success",
                    message: `Order #${orderId} updated to ${nextStatus}.`,
                })
            );
        } catch (err) {
            dispatch(
                showToast({
                    type: "error",
                    message: err?.message || err || "Could not update order status.",
                })
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    if (status === "loading") {
        return (
            <StateMessage
                type="info"
                title="Loading orders"
                message="Please wait while admin orders are being loaded."
            />
        );
    }

    if (status === "failed") {
        return (
            <StateMessage
                type="error"
                title="Could not load orders"
                message={error || "Something went wrong while loading admin orders."}
                action={
                    <button
                        className="btn btn-primary"
                        onClick={() => dispatch(fetchAdminOrdersThunk())}
                    >
                        Retry
                    </button>
                }
            />
        );
    }

    return (
        <section className="card">
            <div className="admin-section-head">
                <div>
                    <h3 style={{ margin: 0 }}>Orders</h3>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                        Track customer orders and update order statuses.
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <StateMessage
                    type="empty"
                    compact
                    title="No orders found"
                    message="Orders will appear here once customers start checking out."
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
                            <th>Update Status</th>
                        </tr>
                        </thead>

                        <tbody>
                        {items.map((order) => (
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
                                <td>
                                    <select
                                        value={order.status || "pending"}
                                        onChange={(e) =>
                                            handleStatusChange(order.id, e.target.value)
                                        }
                                        disabled={updatingOrderId === order.id}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}