import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchProductDetailsThunk = createAsyncThunk(
    "productDetails/fetch",
    async (id, thunkAPI) => {
        try {
            const res = await api.get(`/products/${id}`);
            return res.data.product; // backend returns { ok:true, product }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load product";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    product: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
};

const productDetailsSlice = createSlice({
    name: "productDetails",
    initialState,
    reducers: {
        clearProductDetails(state) {
            state.product = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductDetailsThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProductDetailsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.product = action.payload;
            })
            .addCase(fetchProductDetailsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load product";
                state.product = null;
            });
    },
});

export const { clearProductDetails } = productDetailsSlice.actions;
export default productDetailsSlice.reducer;