import { Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createOrderThunk,
    selectCartItems,
    selectSubtotalCents,
    selectCheckoutError,
    selectCheckoutStatus,
    selectLastOrder,
    clearCheckoutState,
} from "../../cart/cartSlice";
import { selectPaymentMethod } from "../../payments/paymentSlice";
import { formatMoney } from "../../../utils/formatMoney";

const TAX_RATE = 0.1;
const SHIPPING_CENTS = 500;

function validateShipping(values) {
    const errors = {};

    if (!values.name.trim()) {
        errors.name = "Full name is required";
    }

    if (!values.city.trim()) {
        errors.city = "City is required";
    }

    if (!values.address.trim()) {
        errors.address = "Address is required";
    }

    if (!values.phone.trim()) {
        errors.phone = "Phone is required";
    } else if (values.phone.trim().length < 6) {
        errors.phone = "Phone number looks too short";
    }

    return errors;
}

export default function CheckoutPage() {
    const dispatch = useDispatch();

    const items = useSelector(selectCartItems);
    const subtotalCents = useSelector(selectSubtotalCents);
    const checkoutStatus = useSelector(selectCheckoutStatus);
    const checkoutError = useSelector(selectCheckoutError);
    const user = useSelector((s) => s.auth.user);

    const lastOrder = useSelector(selectLastOrder);
    const paymentMethod = useSelector(selectPaymentMethod);

    const [shipping, setShipping] = useState({
        name: user?.full_name || "",
        city: "",
        address: "",
        phone: "",
    });

    const [touched, setTouched] = useState({
        name: false,
        city: false,
        address: false,
        phone: false,
    });

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const isEmpty = items.length === 0;

    useEffect(() => {
        return () => {
            dispatch(clearCheckoutState());
        };
    }, [dispatch]);

    const errors = useMemo(() => validateShipping(shipping), [shipping]);
    const isFormValid = Object.keys(errors).length === 0;

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const shippingCents = SHIPPING_CENTS;
    const totalCents = subtotalCents + taxCents + shippingCents;

    function handleChange(e) {
        const { name, value } = e.target;

        setShipping((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleBlur(e) {
        const { name } = e.target;

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));
    }

    function showError(fieldName) {
        return Boolean((touched[fieldName] || submitAttempted) && errors[fieldName]);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!isFormValid) {
            setTouched({
                name: true,
                city: true,
                address: true,
                phone: true,
            });
            return;
        }

        dispatch(
            createOrderThunk({
                shipping,
                items: items.map((item) => ({
                    product_id: item.id,
                    quantity: item.qty,
                })),
            })
        );
    }

    if (checkoutStatus === "succeeded" && lastOrder?.id) {
        return (
            <Navigate
                to="/profile"
                replace
                state={{
                    orderSuccess: `Order #${lastOrder.id} created successfully. Payment method: ${paymentMethod}. Payment confirmation will be connected next.`,
                }}
            />
        );
    }

    if (isEmpty && checkoutStatus !== "loading") {
        return <Navigate to="/catalog" replace />;
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 16,
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Checkout</h1>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                        Enter your shipping details, review your order, and continue to mock payment.
                    </p>
                </div>

                <Link to="/catalog" className="btn" style={{ textDecoration: "none" }}>
                    Continue Shopping
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {submitAttempted && !isFormValid && (
                    <div
                        className="card"
                        style={{
                            background: "#fff5f5",
                            borderColor: "#ffc9c9",
                            color: "#c92a2a",
                            marginBottom: 16,
                        }}
                    >
                        Please fill in all required shipping fields before confirming your order.
                    </div>
                )}

                {checkoutError && (
                    <div
                        className="card"
                        style={{
                            background: "#fff5f5",
                            borderColor: "#ffc9c9",
                            color: "#c92a2a",
                            marginBottom: 16,
                        }}
                    >
                        {checkoutError}
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 0.95fr",
                        gap: 16,
                        alignItems: "start",
                    }}
                >
                    <div style={{ display: "grid", gap: 16 }}>
                        <section className="card">
                            <h3 style={{ marginTop: 0 }}>Shipping Information</h3>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                    marginTop: 12,
                                }}
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        className="input"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={shipping.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        aria-invalid={showError("name")}
                                    />
                                    {showError("name") && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="city"
                                        style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                    >
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        className="input"
                                        type="text"
                                        placeholder="Enter city"
                                        value={shipping.city}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        aria-invalid={showError("city")}
                                    />
                                    {showError("city") && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {errors.city}
                                        </div>
                                    )}
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label
                                        htmlFor="address"
                                        style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                    >
                                        Address
                                    </label>
                                    <input
                                        id="address"
                                        name="address"
                                        className="input"
                                        type="text"
                                        placeholder="Street, building, apartment..."
                                        value={shipping.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        aria-invalid={showError("address")}
                                    />
                                    {showError("address") && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {errors.address}
                                        </div>
                                    )}
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label
                                        htmlFor="phone"
                                        style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                    >
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        className="input"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={shipping.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        aria-invalid={showError("phone")}
                                    />
                                    {showError("phone") && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="card">
                            <h3 style={{ marginTop: 0 }}>Payment Method</h3>
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    border: "1px solid #e9ecef",
                                    borderRadius: 12,
                                    background: "#f8f9fa",
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>Mock Payment</div>
                                <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                                    Sandbox-style payment flow for Sprint 6. Order will be created first, then payment confirmation will complete the checkout flow.
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="card">
                        <h3 style={{ marginTop: 0 }}>Order Summary</h3>

                        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "56px 1fr auto",
                                        gap: 10,
                                        alignItems: "center",
                                        paddingBottom: 10,
                                        borderBottom: "1px solid #f1f3f5",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 10,
                                            overflow: "hidden",
                                            border: "1px solid #eee",
                                            background: "#fafafa",
                                            display: "grid",
                                            placeItems: "center",
                                        }}
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <span className="muted" style={{ fontSize: 12 }}>
                                                No image
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: 700 }}>{item.title}</div>
                                        <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                                            Qty: {item.qty} × {formatMoney(item.price_cents)}
                                        </div>
                                    </div>

                                    <div style={{ fontWeight: 700 }}>
                                        {formatMoney(item.price_cents * item.qty)}
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: 4, display: "grid", gap: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <span className="muted">Subtotal</span>
                                    <strong>{formatMoney(subtotalCents)}</strong>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <span className="muted">Taxes</span>
                                    <strong>{formatMoney(taxCents)}</strong>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <span className="muted">Shipping</span>
                                    <strong>{formatMoney(shippingCents)}</strong>
                                </div>

                                <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "4px 0" }} />

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        fontSize: 18,
                                    }}
                                >
                                    <span style={{ fontWeight: 800 }}>Total</span>
                                    <strong>{formatMoney(totalCents)}</strong>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={checkoutStatus === "loading"}
                            style={{ width: "100%", marginTop: 16 }}
                        >
                            {checkoutStatus === "loading" ? "Placing Order..." : "Confirm Order"}
                        </button>

                        <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                            Your order will be created after confirmation.
                        </p>
                    </aside>
                </div>
            </form>
        </div>
    );
}