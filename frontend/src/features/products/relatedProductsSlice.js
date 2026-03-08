import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchRelatedProductsThunk = createAsyncThunk(
    "relatedProducts/fetch",
    async ({ categoryId, excludeId }, thunkAPI) => {
        try {
            // We reuse /products endpoint and filter by category
            const res = await api.get("/products", {
                params: { category: categoryId, page: 1, limit: 8 },
            });

            const items = (res.data.items || []).filter(
                (p) => String(p.id) !== String(excludeId)
            );

            return items.slice(0, 4);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load related products";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    items: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
};

const relatedProductsSlice = createSlice({
    name: "relatedProducts",
    initialState,
    reducers: {
        clearRelatedProducts(state) {
            state.items = [];
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRelatedProductsThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchRelatedProductsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload || [];
            })
            .addCase(fetchRelatedProductsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load related products";
                state.items = [];
            });
    },
});

export const { clearRelatedProducts } = relatedProductsSlice.actions;
export default relatedProductsSlice.reducer;