import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProductsThunk } from "../productsSlice";
import StateMessage from "../../../components/StateMessage.jsx";

const DEFAULT_LIMIT = 8;

export default function CatalogPage() {
    const dispatch = useDispatch();

    const productsState = useSelector((state) => state.products);
    const items = productsState.items || [];
    const meta = productsState.meta || {};
    const status = productsState.status;
    const error = productsState.error;

    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(
            fetchProductsThunk({
                page,
                limit: DEFAULT_LIMIT,
                q: query || undefined,
                category: category || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
            })
        );
    }, [dispatch, page, query, category, minPrice, maxPrice]);

    const categories = useMemo(() => {
        const set = new Set(items.map((item) => item.category).filter(Boolean));
        return Array.from(set);
    }, [items]);

    function handleSubmit(e) {
        e.preventDefault();
        setPage(1);
        setQuery(search.trim());
    }

    function handleReset() {
        setSearch("");
        setQuery("");
        setCategory("");
        setMinPrice("");
        setMaxPrice("");
        setPage(1);
    }

    const totalPages = meta.totalPages || 1;
    const totalItems = meta.total || 0;

    return (
        <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ marginBottom: 18 }}>
                <h1 style={{ margin: 0 }}>Catalog</h1>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                    Browse products, search, and filter by category or price.
                </p>
            </div>

            <section className="card" style={{ marginBottom: 18 }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto",
                        gap: 12,
                        alignItems: "end",
                    }}
                >
                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Search
                        </label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setPage(1);
                                setCategory(e.target.value);
                            }}
                        >
                            <option value="">All</option>
                            {categories.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Min Price
                        </label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => {
                                setPage(1);
                                setMinPrice(e.target.value);
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                            Max Price
                        </label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            placeholder="999"
                            value={maxPrice}
                            onChange={(e) => {
                                setPage(1);
                                setMaxPrice(e.target.value);
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>

                    <button type="button" className="btn" onClick={handleReset}>
                        Reset
                    </button>
                </form>
            </section>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 14,
                    flexWrap: "wrap",
                }}
            >
                <div className="muted">
                    {status === "succeeded" ? `${totalItems} products found` : "Loading products..."}
                </div>

                <div className="muted">
                    Page {page} of {totalPages}
                </div>
            </div>

            {status === "loading" && (
                <StateMessage
                    type="info"
                    title="Loading products"
                    message="Please wait while we fetch the latest catalog items."
                />
            )}

            {status === "failed" && (
                <StateMessage
                    type="error"
                    title="Could not load products"
                    message={error || "Something went wrong while loading the catalog."}
                    action={
                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                dispatch(
                                    fetchProductsThunk({
                                        page,
                                        limit: DEFAULT_LIMIT,
                                        q: query || undefined,
                                        category: category || undefined,
                                        minPrice: minPrice || undefined,
                                        maxPrice: maxPrice || undefined,
                                    })
                                )
                            }
                        >
                            Retry
                        </button>
                    }
                />
            )}

            {status === "succeeded" && items.length === 0 && (
                <StateMessage
                    type="empty"
                    title="No products found"
                    message="Try changing your search keyword or filters."
                    action={
                        <button className="btn" onClick={handleReset}>
                            Clear Filters
                        </button>
                    }
                />
            )}

            {status === "succeeded" && items.length > 0 && (
                <>
                    <div
                        className="catalog-grid-4"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: 16,
                        }}
                    >
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 10,
                            marginTop: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            className="btn"
                            disabled={page <= 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        >
                            Previous
                        </button>

                        <button
                            className="btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}