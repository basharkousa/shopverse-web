import { Link } from "react-router-dom";

function formatPrice(priceCents) {
    const n = Number(priceCents || 0);
    return `€${(n / 100).toFixed(2)}`;
}

export default function ProductCard({ product }) {
    const imageUrl =
        (Array.isArray(product.image_urls) && product.image_urls[0]) ||
        product.image_url ||
        "";

    return (
        <div className="card" style={{ overflow: "hidden" }}>
            <div
                style={{
                    height: 180,
                    borderRadius: 12,
                    background: "#fafafa",
                    border: "1px solid #eee",
                    overflow: "hidden",
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div
                        className="muted"
                        style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}
                    >
                        No Image
                    </div>
                )}
            </div>

            <h3 style={{ marginBottom: 8 }}>{product.title}</h3>

            <div className="muted" style={{ marginBottom: 8 }}>
                {formatPrice(product.price_cents)}
            </div>

            <Link className="btn" to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
                View Details
            </Link>
        </div>
    );
}