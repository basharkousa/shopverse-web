import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

// Async thunk: fetch products list with params
export const fetchProductsThunk = createAsyncThunk(
    "products/fetchList",
    async (params, thunkAPI) => {
        try {
            const res = await api.get("/products", { params });
            return res.data; // { ok, items, page, limit, totalItems, totalPages }
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Failed to load products";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    items: [],
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 0,

    // keep filters in Redux so other pages can reuse (optional but clean)
    filters: {
        q: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
    },

    status: "idle", // idle | loading | succeeded | failed
    error: null,
};

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1; // important: reset page when filters change
        },
        clearFilters(state) {
            state.filters = {
                q: "",
                category: "",
                minPrice: "",
                maxPrice: "",
                minRating: "",
            };
            state.page = 1;
        },
        setPage(state, action) {
            state.page = action.payload;
        },
        setLimit(state, action) {
            state.limit = action.payload;
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductsThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProductsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items || [];
                state.page = action.payload.page ?? state.page;
                state.limit = action.payload.limit ?? state.limit;
                state.totalItems = action.payload.totalItems || 0;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchProductsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load products";
                state.items = [];
                state.totalItems = 0;
                state.totalPages = 0;
            });
    },
});

export const { setFilters, clearFilters, setPage, setLimit } =
    productsSlice.actions;

export default productsSlice.reducer;