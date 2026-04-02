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
    clearCart,
    clearLastOrder,
} from "../../cart/cartSlice";
import {
    confirmMockPaymentThunk,
    selectPaymentError,
    selectPaymentStatus,
    clearPaymentState,
} from "../../payments/paymentSlice";
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

function validateCard(values) {
    const errors = {};

    if (!values.name.trim()) {
        errors.name = "Cardholder name is required";
    }

    const cleanedNumber = values.number.replace(/\s+/g, "");
    if (!cleanedNumber) {
        errors.number = "Card number is required";
    } else if (!/^\d{16}$/.test(cleanedNumber)) {
        errors.number = "Card number must be 16 digits";
    }

    if (!values.expiry.trim()) {
        errors.expiry = "Expiry is required";
    } else if (!/^\d{2}\/\d{2}$/.test(values.expiry.trim())) {
        errors.expiry = "Use MM/YY format";
    }

    if (!values.cvc.trim()) {
        errors.cvc = "CVC is required";
    } else if (!/^\d{3,4}$/.test(values.cvc.trim())) {
        errors.cvc = "CVC must be 3 or 4 digits";
    }

    return errors;
}

export default function CheckoutPage() {
    const dispatch = useDispatch();

    const items = useSelector(selectCartItems);
    const subtotalCents = useSelector(selectSubtotalCents);
    const checkoutStatus = useSelector(selectCheckoutStatus);
    const checkoutError = useSelector(selectCheckoutError);
    const lastOrder = useSelector(selectLastOrder);
    const paymentStatus = useSelector(selectPaymentStatus);
    const paymentError = useSelector(selectPaymentError);
    const user = useSelector((s) => s.auth.user);

    const [shipping, setShipping] = useState({
        name: user?.full_name || "",
        city: "",
        address: "",
        phone: "",
    });

    const [card, setCard] = useState({
        name: user?.full_name || "",
        number: "4242424242424242",
        expiry: "12/34",
        cvc: "123",
    });

    const [touched, setTouched] = useState({
        shippingName: false,
        city: false,
        address: false,
        phone: false,
        cardName: false,
        number: false,
        expiry: false,
        cvc: false,
    });

    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [redirectAfterSuccess, setRedirectAfterSuccess] = useState(false);

    const isEmpty = items.length === 0;

    useEffect(() => {
        return () => {
            dispatch(clearCheckoutState());
            dispatch(clearPaymentState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (
            checkoutStatus === "succeeded" &&
            lastOrder?.id &&
            paymentStatus === "idle"
        ) {
            dispatch(
                confirmMockPaymentThunk({
                    orderId: lastOrder.id,
                    card,
                })
            );
        }
    }, [checkoutStatus, lastOrder, paymentStatus, dispatch, card]);

    useEffect(() => {
        if (paymentStatus === "succeeded") {
            dispatch(clearCart());
            dispatch(clearCheckoutState());
            dispatch(clearLastOrder());
            setRedirectAfterSuccess(true);
        }
    }, [paymentStatus, dispatch]);

    const shippingErrors = useMemo(() => validateShipping(shipping), [shipping]);
    const cardErrors = useMemo(() => validateCard(card), [card]);

    const isFormValid =
        Object.keys(shippingErrors).length === 0 &&
        Object.keys(cardErrors).length === 0;

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const shippingCents = SHIPPING_CENTS;
    const totalCents = subtotalCents + taxCents + shippingCents;

    const canRetryExistingPayment = Boolean(
        lastOrder?.id && paymentStatus === "failed"
    );

    function markTouched(key) {
        setTouched((prev) => ({
            ...prev,
            [key]: true,
        }));
    }

    function handleShippingChange(e) {
        const { name, value } = e.target;
        setShipping((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleCardChange(e) {
        const { name, value } = e.target;
        setCard((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function showFieldError(key, message) {
        return Boolean((touched[key] || submitAttempted) && message);
    }

    function handleRetryPayment() {
        if (!lastOrder?.id || paymentStatus === "loading") return;

        dispatch(clearPaymentState());
        dispatch(
            confirmMockPaymentThunk({
                orderId: lastOrder.id,
                card,
            })
        );
    }

    function handleStartFresh() {
        dispatch(clearPaymentState());
        dispatch(clearCheckoutState());
        dispatch(clearLastOrder());
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (checkoutStatus === "loading" || paymentStatus === "loading") {
            return;
        }

        setSubmitAttempted(true);

        if (!isFormValid) {
            setTouched({
                shippingName: true,
                city: true,
                address: true,
                phone: true,
                cardName: true,
                number: true,
                expiry: true,
                cvc: true,
            });
            return;
        }

        if (lastOrder?.id && paymentStatus === "failed") {
            dispatch(clearPaymentState());
            dispatch(
                confirmMockPaymentThunk({
                    orderId: lastOrder.id,
                    card,
                })
            );
            return;
        }

        dispatch(clearPaymentState());
        dispatch(clearCheckoutState());

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

    if (redirectAfterSuccess) {
        return (
            <Navigate
                to="/profile"
                replace
                state={{ orderSuccess: "Your order was placed and paid successfully." }}
            />
        );
    }

    if (isEmpty && checkoutStatus !== "loading" && paymentStatus !== "loading") {
        return <Navigate to="/catalog" replace />;
    }

    const isSubmitting =
        checkoutStatus === "loading" || paymentStatus === "loading";

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
                        Enter your shipping details, review your order, and complete mock
                        payment.
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
                        Please fill in all required shipping and payment fields before
                        confirming your order.
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
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            Order could not be created
                        </div>
                        <div>{checkoutError}</div>
                    </div>
                )}

                {paymentError && (
                    <div
                        className="card"
                        style={{
                            background: "#fff5f5",
                            borderColor: "#ffc9c9",
                            color: "#c92a2a",
                            marginBottom: 16,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                            Payment could not be completed
                        </div>

                        <div>{paymentError}</div>

                        {lastOrder?.id && (
                            <div style={{ marginTop: 8, fontSize: 14 }}>
                                Your order #{lastOrder.id} is still saved as pending. You can
                                retry payment without losing your cart.
                            </div>
                        )}

                        {lastOrder?.id && (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleRetryPayment}
                                    disabled={paymentStatus === "loading"}
                                >
                                    Retry Payment
                                </button>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleStartFresh}
                                    disabled={paymentStatus === "loading"}
                                >
                                    Start Fresh
                                </button>
                            </div>
                        )}
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
                                        htmlFor="shippingName"
                                        style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="shippingName"
                                        name="name"
                                        className="input"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={shipping.name}
                                        onChange={handleShippingChange}
                                        onBlur={() => markTouched("shippingName")}
                                    />
                                    {showFieldError("shippingName", shippingErrors.name) && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {shippingErrors.name}
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
                                        onChange={handleShippingChange}
                                        onBlur={() => markTouched("city")}
                                    />
                                    {showFieldError("city", shippingErrors.city) && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {shippingErrors.city}
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
                                        onChange={handleShippingChange}
                                        onBlur={() => markTouched("address")}
                                    />
                                    {showFieldError("address", shippingErrors.address) && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {shippingErrors.address}
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
                                        onChange={handleShippingChange}
                                        onBlur={() => markTouched("phone")}
                                    />
                                    {showFieldError("phone", shippingErrors.phone) && (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#c92a2a",
                                                fontSize: 13,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {shippingErrors.phone}
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
                                    padding: 14,
                                    borderRadius: 12,
                                    background: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                }}
                            >
                                <div style={{ fontWeight: 700, marginBottom: 10 }}>
                                    Mock Sandbox Payment
                                </div>
                                <p className="muted" style={{ margin: "0 0 14px" }}>
                                    Use <strong>4242424242424242</strong> for success or{" "}
                                    <strong>4000000000000002</strong> to simulate a failed
                                    payment.
                                </p>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label
                                            htmlFor="cardName"
                                            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                        >
                                            Cardholder Name
                                        </label>
                                        <input
                                            id="cardName"
                                            name="name"
                                            className="input"
                                            type="text"
                                            value={card.name}
                                            onChange={handleCardChange}
                                            onBlur={() => markTouched("cardName")}
                                        />
                                        {showFieldError("cardName", cardErrors.name) && (
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    color: "#c92a2a",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {cardErrors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label
                                            htmlFor="number"
                                            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                        >
                                            Card Number
                                        </label>
                                        <input
                                            id="number"
                                            name="number"
                                            className="input"
                                            type="text"
                                            inputMode="numeric"
                                            value={card.number}
                                            onChange={handleCardChange}
                                            onBlur={() => markTouched("number")}
                                        />
                                        {showFieldError("number", cardErrors.number) && (
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    color: "#c92a2a",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {cardErrors.number}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="expiry"
                                            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                        >
                                            Expiry
                                        </label>
                                        <input
                                            id="expiry"
                                            name="expiry"
                                            className="input"
                                            type="text"
                                            placeholder="MM/YY"
                                            value={card.expiry}
                                            onChange={handleCardChange}
                                            onBlur={() => markTouched("expiry")}
                                        />
                                        {showFieldError("expiry", cardErrors.expiry) && (
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    color: "#c92a2a",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {cardErrors.expiry}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="cvc"
                                            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
                                        >
                                            CVC
                                        </label>
                                        <input
                                            id="cvc"
                                            name="cvc"
                                            className="input"
                                            type="text"
                                            inputMode="numeric"
                                            value={card.cvc}
                                            onChange={handleCardChange}
                                            onBlur={() => markTouched("cvc")}
                                        />
                                        {showFieldError("cvc", cardErrors.cvc) && (
                                            <div
                                                style={{
                                                    marginTop: 6,
                                                    color: "#c92a2a",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {cardErrors.cvc}
                                            </div>
                                        )}
                                    </div>
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

                                <hr
                                    style={{
                                        border: 0,
                                        borderTop: "1px solid #eee",
                                        margin: "4px 0",
                                    }}
                                />

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
                            disabled={isSubmitting}
                            style={{ width: "100%", marginTop: 16 }}
                        >
                            {checkoutStatus === "loading"
                                ? "Creating Order..."
                                : paymentStatus === "loading"
                                    ? "Processing Payment..."
                                    : canRetryExistingPayment
                                        ? "Retry Payment"
                                        : "Confirm Order & Pay"}
                        </button>

                        <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                            Your order is created first, then payment is confirmed.
                        </p>
                    </aside>
                </div>
            </form>
        </div>
    );
}