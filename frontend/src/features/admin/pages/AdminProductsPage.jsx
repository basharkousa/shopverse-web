import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminProductsThunk,
    createAdminProductThunk,
    updateAdminProductThunk,
    deleteAdminProductThunk,
    clearAdminProductSubmitState,
    clearAdminProductDeleteState,
    selectAdminProducts,
    selectAdminProductCategories,
    selectAdminProductsStatus,
    selectAdminProductsError,
    selectAdminProductSubmitStatus,
    selectAdminProductSubmitError,
    selectAdminProductDeleteStatus,
    selectAdminProductDeleteError,
} from "../adminProductsSlice";
import { showToast } from "../../../store/uiSlice";
import StateMessage from "../../../components/StateMessage.jsx";

const EMPTY_FORM = {
    title: "",
    description: "",
    price_cents: "",
    image_url: "",
    image_urls: "",
    category_id: "",
    rating: "",
    stock_qty: "",
    replace_images: false,
};

function formatMoney(cents) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format((Number(cents) || 0) / 100);
}

function formatDate(value) {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
}

export default function AdminProductsPage() {
    const dispatch = useDispatch();

    const products = useSelector(selectAdminProducts);
    const categories = useSelector(selectAdminProductCategories);
    const status = useSelector(selectAdminProductsStatus);
    const error = useSelector(selectAdminProductsError);
    const submitStatus = useSelector(selectAdminProductSubmitStatus);
    const submitError = useSelector(selectAdminProductSubmitError);
    const deleteStatus = useSelector(selectAdminProductDeleteStatus);
    const deleteError = useSelector(selectAdminProductDeleteError);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [localFormError, setLocalFormError] = useState("");

    useEffect(() => {
        dispatch(fetchAdminProductsThunk());
    }, [dispatch]);

    useEffect(() => {
        if (submitStatus === "succeeded") {
            dispatch(
                showToast({
                    type: "success",
                    message: editingProduct
                        ? "Product updated successfully."
                        : "Product created successfully.",
                })
            );
            closeForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitStatus, dispatch]);

    useEffect(() => {
        if (submitStatus === "failed" && submitError) {
            dispatch(
                showToast({
                    type: "error",
                    message: submitError,
                })
            );
        }
    }, [submitStatus, submitError, dispatch]);

    useEffect(() => {
        if (deleteStatus === "succeeded") {
            dispatch(
                showToast({
                    type: "success",
                    message: "Product deleted successfully.",
                })
            );
            closeDeleteModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteStatus, dispatch]);

    useEffect(() => {
        if (deleteStatus === "failed" && deleteError) {
            dispatch(
                showToast({
                    type: "error",
                    message: deleteError,
                })
            );
        }
    }, [deleteStatus, deleteError, dispatch]);

    const categoryMap = useMemo(() => {
        const map = new Map();
        for (const c of categories) {
            map.set(Number(c.id), c.name);
        }
        return map;
    }, [categories]);

    function openAddForm() {
        dispatch(clearAdminProductSubmitState());
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setSelectedFiles([]);
        setLocalFormError("");
        setIsFormOpen(true);
    }

    function openEditForm(product) {
        dispatch(clearAdminProductSubmitState());
        setEditingProduct(product);
        setForm({
            title: product.title || "",
            description: product.description || "",
            price_cents: product.price_cents == null ? "" : String(product.price_cents),
            image_url: product.image_url || "",
            image_urls: Array.isArray(product.image_urls)
                ? product.image_urls.join("\n")
                : "",
            category_id: product.category_id == null ? "" : String(product.category_id),
            rating: product.rating == null ? "" : String(product.rating),
            stock_qty: product.stock_qty == null ? "" : String(product.stock_qty),
            replace_images: false,
        });
        setSelectedFiles([]);
        setLocalFormError("");
        setIsFormOpen(true);
    }

    function closeForm() {
        if (submitStatus === "loading") return;
        dispatch(clearAdminProductSubmitState());
        setIsFormOpen(false);
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setSelectedFiles([]);
        setLocalFormError("");
    }

    function openDeleteModal(product) {
        dispatch(clearAdminProductDeleteState());
        setDeletingProduct(product);
        setIsDeleteOpen(true);
    }

    function closeDeleteModal() {
        if (deleteStatus === "loading") return;
        dispatch(clearAdminProductDeleteState());
        setDeletingProduct(null);
        setIsDeleteOpen(false);
    }

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function onFilesChange(e) {
        setSelectedFiles(Array.from(e.target.files || []));
    }

    function validateForm() {
        if (!form.title.trim()) return "Title is required";
        if (form.price_cents === "") return "Price is required";
        if (!Number.isInteger(Number(form.price_cents)) || Number(form.price_cents) < 0) {
            return "Price must be an integer >= 0";
        }
        if (form.category_id === "") return "Category is required";
        if (!Number.isInteger(Number(form.category_id)) || Number(form.category_id) <= 0) {
            return "Category must be valid";
        }
        if (form.stock_qty === "") return "Stock quantity is required";
        if (!Number.isInteger(Number(form.stock_qty)) || Number(form.stock_qty) < 0) {
            return "Stock quantity must be an integer >= 0";
        }
        if (form.rating !== "") {
            const rating = Number(form.rating);
            if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
                return "Rating must be between 0 and 5";
            }
        }
        return "";
    }

    function buildFormData() {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("description", form.description.trim());
        fd.append("price_cents", String(Number(form.price_cents)));
        fd.append("image_url", form.image_url.trim());
        fd.append("image_urls", form.image_urls.trim());
        fd.append("category_id", String(Number(form.category_id)));
        fd.append("rating", form.rating === "" ? "0" : String(Number(form.rating)));
        fd.append("stock_qty", String(Number(form.stock_qty)));
        fd.append("replace_images", String(Boolean(form.replace_images)));
        selectedFiles.forEach((file) => fd.append("images", file));
        return fd;
    }

    async function onSubmitForm(e) {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setLocalFormError(validationError);
            return;
        }

        setLocalFormError("");
        const formData = buildFormData();

        if (editingProduct) {
            await dispatch(updateAdminProductThunk({ id: editingProduct.id, formData }));
        } else {
            await dispatch(createAdminProductThunk(formData));
        }
    }

    async function onConfirmDelete() {
        if (!deletingProduct) return;
        await dispatch(deleteAdminProductThunk(deletingProduct.id));
    }

    if (status === "loading") {
        return (
            <StateMessage
                type="info"
                title="Loading products"
                message="Please wait while admin products are being loaded."
            />
        );
    }

    if (status === "failed") {
        return (
            <StateMessage
                type="error"
                title="Could not load products"
                message={error || "Something went wrong while loading admin products."}
                action={
                    <button
                        className="btn btn-primary"
                        onClick={() => dispatch(fetchAdminProductsThunk())}
                    >
                        Retry
                    </button>
                }
            />
        );
    }

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <section className="card">
                <div className="admin-section-head">
                    <div>
                        <h1 style={{ margin: 0 }}>Products</h1>
                        <p className="muted" style={{ margin: "6px 0 0" }}>
                            Manage catalog products, stock, category, pricing, and images.
                        </p>
                    </div>

                    <button className="btn btn-primary" onClick={openAddForm}>
                        Add Product
                    </button>
                </div>

                {products.length === 0 ? (
                    <StateMessage
                        type="empty"
                        compact
                        title="No products found"
                        message="Create your first product to start managing the catalog."
                        action={
                            <button className="btn btn-primary" onClick={openAddForm}>
                                Create Product
                            </button>
                        }
                    />
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Rating</th>
                                <th>Stock</th>
                                <th>Photos</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>#{product.id}</td>
                                    <td>
                                        <div className="admin-product-cell">
                                            <div className="admin-product-thumb">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.title}
                                                        className="admin-product-thumb__img"
                                                    />
                                                ) : (
                                                    <div className="admin-product-thumb__placeholder">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div style={{ fontWeight: 800 }}>{product.title}</div>
                                                <div
                                                    className="muted"
                                                    style={{ fontSize: 14, marginTop: 4, maxWidth: 280 }}
                                                >
                                                    {product.description || "No description"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {product.category_name ||
                                            categoryMap.get(Number(product.category_id)) ||
                                            "-"}
                                    </td>
                                    <td>{formatMoney(product.price_cents)}</td>
                                    <td>{Number(product.rating || 0).toFixed(1)}</td>
                                    <td>
                      <span
                          className={
                              Number(product.stock_qty) > 0
                                  ? "status-pill status-pill--paid"
                                  : "status-pill status-pill--cancelled"
                          }
                      >
                        {Number(product.stock_qty) > 0
                            ? `${product.stock_qty} in stock`
                            : "Out of stock"}
                      </span>
                                    </td>
                                    <td>
                                        {Array.isArray(product.image_urls)
                                            ? product.image_urls.length
                                            : product.image_url
                                                ? 1
                                                : 0}
                                    </td>
                                    <td>{formatDate(product.created_at)}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button className="btn" onClick={() => openEditForm(product)}>
                                                Edit
                                            </button>
                                            <button className="btn" onClick={() => openDeleteModal(product)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {isFormOpen && (
                <div className="admin-modal-backdrop" onClick={closeForm}>
                    <div
                        className="admin-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="admin-modal__head">
                            <div>
                                <h2 style={{ margin: 0 }}>
                                    {editingProduct ? "Edit Product" : "Add Product"}
                                </h2>
                                <p className="muted" style={{ margin: "6px 0 0" }}>
                                    Fill in the product details below.
                                </p>
                            </div>
                            <button className="btn" onClick={closeForm}>
                                Close
                            </button>
                        </div>

                        <form onSubmit={onSubmitForm} className="admin-form-grid">
                            <label className="admin-field">
                                <span>Title</span>
                                <input
                                    className="input"
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="Product title"
                                />
                            </label>

                            <label className="admin-field admin-field--full">
                                <span>Description</span>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="Product description"
                                />
                            </label>

                            <label className="admin-field">
                                <span>Price (cents)</span>
                                <input
                                    className="input"
                                    inputMode="numeric"
                                    value={form.price_cents}
                                    onChange={(e) => updateField("price_cents", e.target.value)}
                                    placeholder="1999"
                                />
                            </label>

                            <label className="admin-field">
                                <span>Stock Qty</span>
                                <input
                                    className="input"
                                    inputMode="numeric"
                                    value={form.stock_qty}
                                    onChange={(e) => updateField("stock_qty", e.target.value)}
                                    placeholder="25"
                                />
                            </label>

                            <label className="admin-field">
                                <span>Category</span>
                                <select
                                    value={form.category_id}
                                    onChange={(e) => updateField("category_id", e.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="admin-field">
                                <span>Rating</span>
                                <input
                                    className="input"
                                    inputMode="decimal"
                                    value={form.rating}
                                    onChange={(e) => updateField("rating", e.target.value)}
                                    placeholder="4.5"
                                />
                            </label>

                            <label className="admin-field admin-field--full">
                                <span>Primary Image URL (optional)</span>
                                <input
                                    className="input"
                                    value={form.image_url}
                                    onChange={(e) => updateField("image_url", e.target.value)}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </label>

                            <label className="admin-field admin-field--full">
                                <span>Extra Image URLs (optional, one per line)</span>
                                <textarea
                                    rows={4}
                                    value={form.image_urls}
                                    onChange={(e) => updateField("image_urls", e.target.value)}
                                    placeholder={`https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg`}
                                />
                            </label>

                            <label className="admin-field admin-field--full">
                                <span>Upload Photos</span>
                                <input type="file" accept="image/*" multiple onChange={onFilesChange} />
                                <div className="muted" style={{ fontSize: 14 }}>
                                    {selectedFiles.length > 0
                                        ? `${selectedFiles.length} file(s) selected`
                                        : "You can upload multiple photos here."}
                                </div>
                            </label>

                            {editingProduct && (
                                <label className="admin-field admin-field--full">
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        type="checkbox"
                        checked={form.replace_images}
                        onChange={(e) => updateField("replace_images", e.target.checked)}
                    />
                    Replace existing images instead of adding to them
                  </span>
                                </label>
                            )}

                            {editingProduct &&
                                Array.isArray(editingProduct.image_urls) &&
                                editingProduct.image_urls.length > 0 && (
                                    <div className="admin-field admin-field--full">
                                        <span>Current Photos</span>
                                        <div className="admin-thumb-list">
                                            {editingProduct.image_urls.map((url, idx) => (
                                                <img
                                                    key={`${url}-${idx}`}
                                                    src={url}
                                                    alt={`product-${idx}`}
                                                    className="admin-thumb-list__img"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {(localFormError || submitError) && (
                                <div className="admin-alert admin-alert--error admin-field--full">
                                    {localFormError || submitError}
                                </div>
                            )}

                            <div className="admin-form-actions admin-field--full">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={closeForm}
                                    disabled={submitStatus === "loading"}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitStatus === "loading"}
                                >
                                    {submitStatus === "loading"
                                        ? "Saving..."
                                        : editingProduct
                                            ? "Save Changes"
                                            : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteOpen && deletingProduct && (
                <div className="admin-modal-backdrop" onClick={closeDeleteModal}>
                    <div
                        className="admin-modal admin-modal--sm"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="admin-modal__head">
                            <div>
                                <h2 style={{ margin: 0 }}>Delete Product</h2>
                                <p className="muted" style={{ margin: "6px 0 0" }}>
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p style={{ marginTop: 0 }}>
                            Are you sure you want to delete <strong>{deletingProduct.title}</strong>?
                        </p>

                        {deleteError && (
                            <div className="admin-alert admin-alert--error">{deleteError}</div>
                        )}

                        <div className="admin-form-actions">
                            <button
                                className="btn"
                                onClick={closeDeleteModal}
                                disabled={deleteStatus === "loading"}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={onConfirmDelete}
                                disabled={deleteStatus === "loading"}
                            >
                                {deleteStatus === "loading" ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}