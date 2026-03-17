import { Link,useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    removeFromCart,
    selectCartItems,
    selectSubtotalCents,
    updateQty,
} from "../cartSlice";
import { formatMoney } from "../../../utils/formatMoney";


const TAX_RATE = 0.1;
const SHIPPING_CENTS = 500;

export default function CartPage() {
    const dispatch = useDispatch();
    const items = useSelector(selectCartItems);
    const navigate = useNavigate();
    const subtotalCents = useSelector(selectSubtotalCents);

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const shippingCents = items.length > 0 ? SHIPPING_CENTS : 0;
    const totalCents = subtotalCents + taxCents + shippingCents;

    const isEmpty = items.length === 0;

    function handleProceedToCheckout() {
        if (isEmpty) return;
        navigate("/checkout");
    }

    function handleDecrease(item) {
        if (item.qty <= 1) return;
        dispatch(updateQty({ productId: item.id, qty: item.qty - 1 }));
    }

    function handleIncrease(item) {
        if (
            typeof item.stock_qty === "number" &&
            item.qty >= item.stock_qty
        ) {
            return;
        }

        dispatch(updateQty({ productId: item.id, qty: item.qty + 1 }));
    }

    function handleQtyInput(item, value) {
        const parsed = Number(value);

        if (Number.isNaN(parsed)) return;
        dispatch(updateQty({ productId: item.id, qty: parsed }));
    }

    function handleRemove(productId) {
        dispatch(removeFromCart(productId));
    }

    if (isEmpty) {
        return (
            <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
                <div className="card" style={{ textAlign: "center", padding: 32 }}>
                    <h2 style={{ marginTop: 0 }}>Your cart is empty</h2>
                    <p className="muted" style={{ marginTop: 8 }}>
                        Looks like you haven’t added anything yet.
                    </p>

                    <div style={{ marginTop: 16 }}>
                        <Link className="btn btn-primary" to="/catalog" style={{ textDecoration: "none" }}>
                            Go to Catalog
                        </Link>
                    </div>
                </div>
            </div>
        );
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
                    <h1 style={{ margin: 0 }}>My Cart</h1>
                    <p className="muted" style={{ margin: "6px 0 0" }}>
                        Review your items before checkout.
                    </p>
                </div>

                <Link to="/catalog" className="btn" style={{ textDecoration: "none" }}>
                    Continue Shopping
                </Link>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 0.9fr",
                    gap: 16,
                    alignItems: "start",
                }}
            >
                <div style={{ display: "grid", gap: 12 }}>
                    {items.map((item) => {
                        const itemSubtotal = item.price_cents * item.qty;
                        const canIncrease =
                            typeof item.stock_qty !== "number" || item.qty < item.stock_qty;

                        return (
                            <div key={item.id} className="card">
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "110px 1fr",
                                        gap: 14,
                                        alignItems: "start",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            height: 110,
                                            borderRadius: 12,
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
                                            <span className="muted">No image</span>
                                        )}
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                alignItems: "start",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ margin: 0 }}>{item.title}</h3>
                                                <div className="muted" style={{ marginTop: 6 }}>
                                                    Unit price: {formatMoney(item.price_cents)}
                                                </div>
                                                <div className="muted" style={{ marginTop: 4, fontSize: 14 }}>
                                                    Stock: {item.stock_qty ?? "-"}
                                                </div>
                                            </div>

                                            <button
                                                className="btn"
                                                onClick={() => handleRemove(item.id)}
                                                type="button"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                flexWrap: "wrap",
                                                marginTop: 14,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => handleDecrease(item)}
                                                    disabled={item.qty <= 1}
                                                >
                                                    −
                                                </button>

                                                <input
                                                    className="input"
                                                    type="number"
                                                    min="1"
                                                    max={item.stock_qty ?? undefined}
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleQtyInput(item, e.target.value)
                                                    }
                                                    style={{ width: 80, textAlign: "center" }}
                                                />

                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={!canIncrease}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div style={{ fontWeight: 800, fontSize: 18 }}>
                                                {formatMoney(itemSubtotal)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <aside className="card">
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>

                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <span className="muted">Subtotal</span>
                            <strong>{formatMoney(subtotalCents)}</strong>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <span className="muted">Taxes</span>
                            <strong>{formatMoney(taxCents)}</strong>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
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

                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleProceedToCheckout}
                        disabled={isEmpty}
                        style={{ width: "100%", marginTop: 16 }}
                    >
                        Proceed to Checkout
                    </button>

                </aside>
            </div>
        </div>
    );
}