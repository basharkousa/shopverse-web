import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { fetchMyOrdersThunk } from "../../orders/ordersSlice";
import { showToast } from "../../../store/uiSlice";
import { formatMoney } from "../../../utils/formatMoney";
import StateMessage from "../../../components/StateMessage.jsx";

function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "status-pill status-pill--paid";
    if (value === "shipped") return "status-pill status-pill--shipped";
    if (value === "cancelled") return "status-pill status-pill--cancelled";
    return "status-pill status-pill--pending";
}

export default function ProfilePage() {
    const dispatch = useDispatch();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const orders = useSelector((state) => state.orders.items || []);
    const ordersStatus = useSelector((state) => state.orders.status);
    const ordersError = useSelector((state) => state.orders.error);

    useEffect(() => {
        dispatch(fetchMyOrdersThunk());
    }, [dispatch]);

    useEffect(() => {
        const successMessage = location.state?.orderSuccess;
        if (successMessage) {
            dispatch(
                showToast({
                    type: "success",
                    message: successMessage,
                })
            );
            window.history.replaceState({}, document.title);
        }
    }, [location.state, dispatch]);

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ marginBottom: 18 }}>
                <h1 style={{ margin: 0 }}>My Profile</h1>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                    Review your account details and your order history.
                </p>
            </div>

            <section className="card" style={{ marginBottom: 18 }}>
                <h3 style={{ marginTop: 0 }}>Account Information</h3>

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <div>
                        <strong>Name:</strong> {user?.full_name || "—"}
                    </div>
                    <div>
                        <strong>Email:</strong> {user?.email || "—"}
                    </div>
                    <div>
                        <strong>Role:</strong> {user?.role || "customer"}
                    </div>
                </div>
            </section>

            <section className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0 }}>My Orders</h3>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Track your past and current orders.
                        </p>
                    </div>

                    <Link to="/catalog" className="btn" style={{ textDecoration: "none" }}>
                        Continue Shopping
                    </Link>
                </div>

                {ordersStatus === "loading" && (
                    <StateMessage
                        type="info"
                        title="Loading orders"
                        message="Please wait while we fetch your order history."
                    />
                )}

                {ordersStatus === "failed" && (
                    <StateMessage
                        type="error"
                        title="Could not load orders"
                        message={ordersError || "Something went wrong while loading your orders."}
                        action={
                            <button
                                className="btn btn-primary"
                                onClick={() => dispatch(fetchMyOrdersThunk())}
                            >
                                Retry
                            </button>
                        }
                    />
                )}

                {ordersStatus === "succeeded" && orders.length === 0 && (
                    <StateMessage
                        type="empty"
                        title="No orders yet"
                        message="You have not placed any orders yet."
                        action={
                            <Link
                                to="/catalog"
                                className="btn btn-primary"
                                style={{ textDecoration: "none" }}
                            >
                                Start Shopping
                            </Link>
                        }
                    />
                )}

                {ordersStatus === "succeeded" && orders.length > 0 && (
                    <div className="admin-table-wrap" style={{ marginTop: 12 }}>
                        <table className="admin-table" style={{ minWidth: 620 }}>
                            <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
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