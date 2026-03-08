import { Link } from "react-router-dom";

export default function HomePage() {
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
                        Discover great deals, new arrivals, and best sellers — all in one
                        place.
                    </p>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link className="btn" to="/catalog">
                            Shop Now
                        </Link>
                        <Link className="btn" to="/catalog" style={{ textDecoration: "none" }}>
                            Browse Catalog
                        </Link>
                    </div>
                </div>

                {/* Image placeholder */}
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

            {/* FEATURED */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Featured</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                    }}
                >
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Best Sellers</h3>
                        <p className="muted">Top products people love.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>New Arrivals</h3>
                        <p className="muted">Fresh products added weekly.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ marginTop: 0 }}>Special Offers</h3>
                        <p className="muted">Limited-time discounts.</p>
                    </div>
                </div>
            </div>

            {/* CATEGORIES */}
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Shop by Category</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 12,
                    }}
                >
                    {["Electronics", "Fashion", "Home", "Sports"].map((c) => (
                        <Link
                            key={c}
                            to="/catalog"
                            className="card"
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div style={{ fontWeight: 800 }}>{c}</div>
                            <div className="muted" style={{ marginTop: 6 }}>
                                Explore {c.toLowerCase()}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* BENEFITS */}
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
                        <p className="muted">Simple refund/return policy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}