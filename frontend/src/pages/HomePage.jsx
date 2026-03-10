import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeDataThunk } from "../features/home/homeSlice";
import ProductCard from "../features/products/components/ProductCard";
import { setFilters } from "../features/products/productsSlice";

export default function HomePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, categories, featured, newArrivals } = useSelector(
        (s) => s.home
    );

    useEffect(() => {
        dispatch(fetchHomeDataThunk());
    }, [dispatch]);

    function onCategoryClick(catId) {
        dispatch(setFilters({ category: String(catId) })); // sets + resets page
        navigate("/catalog");
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            {/* HERO */}
            <div
                className="card"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: 16,
                    alignItems: "center",
                }}
            >
                <div>
                    <h1 style={{ marginTop: 0, marginBottom: 8 }}>ShopVerse</h1>
                    <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
                        Discover best sellers, new arrivals, and special offers.
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link className="btn" to="/catalog" style={{ textDecoration: "none" }}>
                            Shop Now
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        height: 180,
                        borderRadius: 12,
                        border: "1px dashed #ccc",
                        background: "#fafafa",
                        display: "grid",
                        placeItems: "center",
                        color: "#777",
                        fontWeight: 700,
                    }}
                >
                    Hero Image
                </div>
            </div>

            {/* Loading / Error */}
            {status === "loading" && (
                <div className="card" style={{ marginTop: 12 }}>
                    Loading home data…
                </div>
            )}

            {status === "failed" && (
                <div
                    className="card"
                    style={{
                        marginTop: 12,
                        borderColor: "#f5c2c7",
                        background: "#f8d7da",
                        color: "#842029",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Categories */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Shop by Category</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                    }}
                >
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            className="card"
                            onClick={() => onCategoryClick(c.id)}
                            style={{
                                textAlign: "left",
                                cursor: "pointer",
                                border: "1px solid #e6e6e6",
                            }}
                        >
                            <div style={{ fontWeight: 800 }}>{c.name}</div>
                            <div className="muted" style={{ marginTop: 6 }}>
                                Explore {c.name.toLowerCase()}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Best Sellers</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                    }}
                >
                    {featured.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>

            {/* New Arrivals */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>New Arrivals</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                    }}
                >
                    {newArrivals.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>

            {/* Benefits */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Why Shop With Us?</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                    }}
                >
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Fast Delivery</h3>
                        <p className="muted">Quick and reliable shipping.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Secure Payment</h3>
                        <p className="muted">Sandbox payment now, real flow later.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Easy Returns</h3>
                        <p className="muted">Simple return policy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}