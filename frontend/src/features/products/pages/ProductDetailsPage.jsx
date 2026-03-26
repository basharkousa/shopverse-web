import { useEffect, useMemo, useState } from "react";
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

import { addToCart } from "../../cart/cartSlice";

function formatPrice(priceCents) {
    const n = Number(priceCents || 0);
    return `€${(n / 100).toFixed(2)}`;
}

function Stars({ rating }) {
    const r = Number(rating || 0);
    const full = Math.round(r);
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
    const related = useSelector((s) => s.relatedProducts);

    const [cartMessage, setCartMessage] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        dispatch(fetchProductDetailsThunk(id));
        return () => {
            dispatch(clearProductDetails());
        };
    }, [dispatch, id]);

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

    useEffect(() => {
        setActiveImageIndex(0);
    }, [product?.id]);

    const imageList = useMemo(() => {
        const urls = Array.isArray(product?.image_urls) ? product.image_urls.filter(Boolean) : [];
        if (urls.length > 0) return urls;
        return product?.image_url ? [product.image_url] : [];
    }, [product]);

    function handleAddToCart() {
        if (!product || !inStock) return;

        dispatch(
            addToCart({
                id: product.id,
                title: product.title,
                price_cents: product.price_cents,
                image_url: product.image_url,
                stock_qty: product.stock_qty,
            })
        );

        setCartMessage("Added to cart");

        window.clearTimeout(handleAddToCart._timer);
        handleAddToCart._timer = window.setTimeout(() => {
            setCartMessage("");
        }, 1800);
    }

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
    const activeImage = imageList[activeImageIndex] || null;

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
                        {activeImage ? (
                            <img
                                src={activeImage}
                                alt={product.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <span className="muted">No Image</span>
                        )}
                    </div>

                    {imageList.length > 1 && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            {imageList.map((url, idx) => (
                                <button
                                    key={`${url}-${idx}`}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    style={{
                                        width: 64,
                                        height: 64,
                                        padding: 0,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        border:
                                            idx === activeImageIndex
                                                ? "2px solid var(--brand-600)"
                                                : "1px solid #ddd",
                                        background: "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    <img
                                        src={url}
                                        alt={`${product.title}-${idx + 1}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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

                    <button
                        className="btn"
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        style={{ marginTop: 12 }}
                    >
                        Add to Cart
                    </button>

                    {cartMessage && (
                        <div
                            style={{
                                marginTop: 10,
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "#ebfbee",
                                color: "#2b8a3e",
                                fontWeight: 700,
                                fontSize: 14,
                            }}
                        >
                            {cartMessage}
                        </div>
                    )}

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