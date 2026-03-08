import { Link } from "react-router-dom";

function formatPrice(priceCents) {
    const n = Number(priceCents || 0);
    return `€${(n / 100).toFixed(2)}`;
}

export default function ProductCard({ product }) {
    return (
        <div className="card" style={{ display: "grid", gap: 10 }}>
            <div
                style={{
                    height: 140,
                    borderRadius: 10,
                    border: "1px solid #eee",
                    background: "#fafafa",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                {product?.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                    />
                ) : (
                    <span className="muted">No Image</span>
                )}
            </div>

            <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                {product?.title || "Untitled"}
            </div>

            <div className="muted">{formatPrice(product?.price_cents)}</div>

            <Link
                className="btn"
                to={`/products/${product.id}`}
                style={{ textDecoration: "none", textAlign: "center" }}
            >
                View Details
            </Link>
        </div>
    );
}