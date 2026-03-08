import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
    clearProductDetails,
    fetchProductDetailsThunk,
} from "../productDetailsSlice";

import ProductCard from "../components/ProductCard";
import {
    clearRelatedProducts,
    fetchRelatedProductsThunk,
} from "../relatedProductsSlice";

function formatPrice(priceCents) {
    const n = Number(priceCents || 0);
    return `€${(n / 100).toFixed(2)}`;
}

function Stars({ rating }) {
    const r = Number(rating || 0);
    const full = Math.round(r); // simple for now
    return (
        <div className="muted" style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < full ? "★" : "☆"}</span>
            ))}
            <span style={{ marginLeft: 6 }}>({r.toFixed(1)})</span>
        </div>
    );
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { product, status, error } = useSelector((s) => s.productDetails);


    useEffect(() => {
        dispatch(fetchProductDetailsThunk(id));
        return () => {
            dispatch(clearProductDetails());
        };
    }, [dispatch, id]);

    const related = useSelector((s) => s.relatedProducts);

    useEffect(() => {
        if (product?.category_id) {
            dispatch(
                fetchRelatedProductsThunk({
                    categoryId: product.category_id,
                    excludeId: product.id,
                })
            );
        }

        return () => {
            dispatch(clearRelatedProducts());
        };
    }, [dispatch, product?.category_id, product?.id]);

    if (status === "loading") {
        return (
            <div className="container" style={{ paddingTop: 24 }}>
                <div className="card">Loading product…</div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="container" style={{ paddingTop: 24 }}>
                <div
                    className="card"
                    style={{
                        borderColor: "#f5c2c7",
                        background: "#f8d7da",
                        color: "#842029",
                    }}
                >
                    {error}
                </div>
                <div style={{ marginTop: 12 }}>
                    <Link className="btn" to="/catalog" style={{ textDecoration: "none" }}>
                        Back to Catalog
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: 24 }}>
                <div className="card">Product not found.</div>
            </div>
        );
    }

    const inStock = Number(product.stock_qty || 0) > 0;

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <Link className="btn" to="/catalog" style={{ textDecoration: "none" }}>
                ← Back
            </Link>

            <div
                style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr",
                    gap: 12,
                    alignItems: "start",
                }}
            >
                {/* Image */}
                <div className="card" style={{ padding: 12 }}>
                    <div
                        style={{
                            height: 320,
                            borderRadius: 12,
                            border: "1px solid #eee",
                            background: "#fafafa",
                            overflow: "hidden",
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <span className="muted">No Image</span>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="card">
                    <h2 style={{ marginTop: 0 }}>{product.title}</h2>

                    <Stars rating={product.rating} />

                    <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                        {formatPrice(product.price_cents)}
                    </div>

                    <div style={{ marginTop: 8 }}>
            <span
                style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 12,
                    background: inStock ? "#ebfbee" : "#fff5f5",
                    color: inStock ? "#2b8a3e" : "#c92a2a",
                }}
            >
              {inStock ? "Available" : "Out of stock"}
            </span>
                    </div>

                    <p className="muted" style={{ marginTop: 14 }}>
                        {product.description || "No description."}
                    </p>

                    <button className="btn" disabled={!inStock} style={{ marginTop: 12 }}>
                        Add to Cart
                    </button>

                    {/* Optional: show category */}
                    {product.category_name && (
                        <div className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                            Category: <strong>{product.category_name}</strong>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 10 }}>Related Products</h3>

                {related.status === "loading" ? (
                    <div className="card">Loading related products…</div>
                ) : related.status === "failed" ? (
                    <div className="card" style={{ color: "#842029", background: "#f8d7da" }}>
                        {related.error}
                    </div>
                ) : related.items.length === 0 ? (
                    <div className="card" style={{ textAlign: "center" }}>
                        <div className="muted">No related products found.</div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 12,
                        }}
                    >
                        {related.items.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}