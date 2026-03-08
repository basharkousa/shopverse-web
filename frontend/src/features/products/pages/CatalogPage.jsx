import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import {
    clearFilters,
    fetchProductsThunk,
    setFilters,
    setPage,
} from "../productsSlice";

function eurosToCents(value) {
    const n = Number(String(value).replace(",", "."));
    if (!Number.isFinite(n)) return undefined;
    return Math.round(n * 100);
}

export default function CatalogPage() {
    const dispatch = useDispatch();

    const { items, page, limit, totalItems, totalPages, filters, status, error } =
        useSelector((s) => s.products);

    const { q, category, minPrice, maxPrice, minRating } = filters;

    // Build params object for backend
    const params = useMemo(() => {
        return {
            page,
            limit,
            q: q.trim() || undefined,
            category: category || undefined,
            minPrice: minPrice ? eurosToCents(minPrice) : undefined,
            maxPrice: maxPrice ? eurosToCents(maxPrice) : undefined,
            minRating: minRating ? Number(minRating) : undefined,
        };
    }, [page, limit, q, category, minPrice, maxPrice, minRating]);

    // Fetch products when params change
    useEffect(() => {
        dispatch(fetchProductsThunk(params));
    }, [dispatch, params]);

    function onSearchSubmit(e) {
        e.preventDefault();
        dispatch(setPage(1));
        dispatch(fetchProductsThunk({ ...params, page: 1 }));
    }

    function onClear() {
        dispatch(clearFilters());
    }

    function goPrev() {
        dispatch(setPage(Math.max(1, page - 1)));
    }

    function goNext() {
        if (totalPages && page >= totalPages) return;
        dispatch(setPage(page + 1));
    }

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <h2 style={{ marginTop: 0 }}>Catalog</h2>

            {/* Search + results */}
            <div className="card" style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <form
                    onSubmit={onSearchSubmit}
                    style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                >
                    <input
                        value={q}
                        onChange={(e) => dispatch(setFilters({ q: e.target.value }))}
                        placeholder="Search products..."
                        style={{
                            flex: "1 1 240px",
                            padding: 10,
                            borderRadius: 10,
                            border: "1px solid #ddd",
                        }}
                    />
                    <button className="btn" type="submit">
                        Search
                    </button>
                    <button className="btn" type="button" onClick={onClear}>
                        Clear
                    </button>
                </form>

                <div className="muted" style={{ fontSize: 14 }}>
                    {totalItems} products found
                </div>
            </div>

            {/* Filters + grid */}
            <div
                style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "280px 1fr",
                    gap: 12,
                    alignItems: "start",
                }}
            >
                {/* Filters */}
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>Filters</h3>

                    <div style={{ display: "grid", gap: 12 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontWeight: 700 }}>Category</span>
                            <select
                                value={category}
                                onChange={(e) =>
                                    dispatch(setFilters({ category: e.target.value }))
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    border: "1px solid #ddd",
                                }}
                            >
                                <option value="">All</option>
                                <option value="1">Electronics</option>
                                <option value="2">Fashion</option>
                                <option value="3">Home</option>
                                <option value="4">Sports</option>
                            </select>
                        </label>

                        <div style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontWeight: 700 }}>Price range (€)</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    value={minPrice}
                                    onChange={(e) =>
                                        dispatch(setFilters({ minPrice: e.target.value }))
                                    }
                                    placeholder="Min"
                                    inputMode="numeric"
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 10,
                                        border: "1px solid #ddd",
                                    }}
                                />
                                <input
                                    value={maxPrice}
                                    onChange={(e) =>
                                        dispatch(setFilters({ maxPrice: e.target.value }))
                                    }
                                    placeholder="Max"
                                    inputMode="numeric"
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 10,
                                        border: "1px solid #ddd",
                                    }}
                                />
                            </div>
                            <div className="muted" style={{ fontSize: 12 }}>
                                We convert € to cents when calling the API.
                            </div>
                        </div>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span style={{ fontWeight: 700 }}>Rating</span>
                            <select
                                value={minRating}
                                onChange={(e) =>
                                    dispatch(setFilters({ minRating: e.target.value }))
                                }
                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    border: "1px solid #ddd",
                                }}
                            >
                                <option value="">All</option>
                                <option value="1">1+ stars</option>
                                <option value="2">2+ stars</option>
                                <option value="3">3+ stars</option>
                                <option value="4">4+ stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: "grid", gap: 12 }}>
                    {status === "loading" ? (
                        <div className="card">Loading products…</div>
                    ) : status === "failed" ? (
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
                    ) : items.length === 0 ? (
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800 }}>No results</div>
                            <div className="muted" style={{ marginTop: 6 }}>
                                Try changing search or filters.
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 12,
                            }}
                        >
                            {items.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div
                        className="card"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <button className="btn" onClick={goPrev} disabled={page <= 1}>
                            Prev
                        </button>

                        <div className="muted">
                            Page {page} {totalPages ? `of ${totalPages}` : ""}
                        </div>

                        <button
                            className="btn"
                            onClick={goNext}
                            disabled={totalPages ? page >= totalPages : false}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}