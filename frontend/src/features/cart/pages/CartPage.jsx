import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    removeFromCart,
    selectCartItems,
    selectSubtotalCents,
    updateQty,
} from "../cartSlice";
import { formatMoney } from "../../../utils/formatMoney";
import StateMessage from "../../../components/StateMessage.jsx";

const TAX_RATE = 0.1;
const SHIPPING_CENTS = 500;

export default function CartPage() {
    const dispatch = useDispatch();
    const items = useSelector(selectCartItems);
    const subtotalCents = useSelector(selectSubtotalCents);

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents + SHIPPING_CENTS;

    if (items.length === 0) {
        return (
            <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
                <StateMessage
                    type="empty"
                    title="Your cart is empty"
                    message="Add some products to your cart to continue shopping."
                    action={
                        <Link to="/catalog" className="btn btn-primary" style={{ textDecoration: "none" }}>
                            Browse Catalog
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ marginBottom: 18 }}>
                <h1 style={{ margin: 0 }}>Your Cart</h1>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                    Review your items, update quantities, and continue to checkout.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 0.9fr",
                    gap: 16,
                    alignItems: "start",
                }}
            >
                <section className="card">
                    <div style={{ display: "grid", gap: 14 }}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "88px 1fr auto",
                                    gap: 14,
                                    alignItems: "center",
                                    borderBottom: "1px solid #f1f3f5",
                                    paddingBottom: 14,
                                }}
                            >
                                <div
                                    style={{
                                        width: 88,
                                        height: 88,
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
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <span className="muted" style={{ fontSize: 12 }}>
                      No image
                    </span>
                                    )}
                                </div>

                                <div>
                                    <div style={{ fontWeight: 800 }}>{item.title}</div>
                                    <div className="muted" style={{ marginTop: 6 }}>
                                        {formatMoney(item.price_cents)}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 10,
                                            alignItems: "center",
                                            marginTop: 10,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <label style={{ fontWeight: 700 }}>Qty</label>
                                        <input
                                            className="input"
                                            type="number"
                                            min="1"
                                            max={item.stock_qty || 999}
                                            value={item.qty}
                                            onChange={(e) =>
                                                dispatch(
                                                    updateQty({
                                                        productId: item.id,
                                                        qty: Number(e.target.value),
                                                    })
                                                )
                                            }
                                            style={{ width: 90 }}
                                        />

                                        <button
                                            className="btn"
                                            onClick={() => dispatch(removeFromCart(item.id))}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div style={{ fontWeight: 800 }}>
                                    {formatMoney(item.price_cents * item.qty)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="card">
                    <h3 style={{ marginTop: 0 }}>Summary</h3>

                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="muted">Subtotal</span>
                            <strong>{formatMoney(subtotalCents)}</strong>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="muted">Taxes</span>
                            <strong>{formatMoney(taxCents)}</strong>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="muted">Shipping</span>
                            <strong>{formatMoney(SHIPPING_CENTS)}</strong>
                        </div>

                        <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "4px 0" }} />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 18,
                            }}
                        >
                            <span style={{ fontWeight: 800 }}>Total</span>
                            <strong>{formatMoney(totalCents)}</strong>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                        <Link to="/checkout" className="btn btn-primary" style={{ textDecoration: "none", textAlign: "center" }}>
                            Proceed to Checkout
                        </Link>

                        <Link to="/catalog" className="btn" style={{ textDecoration: "none", textAlign: "center" }}>
                            Continue Shopping
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}