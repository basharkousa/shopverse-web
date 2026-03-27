import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchAdminProductsThunk = createAsyncThunk(
    "adminProducts/fetchAdminProducts",
    async (_, thunkAPI) => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get("/admin/products"),
                api.get("/categories"),
            ]);

            return {
                items: productsRes.data.items || [],
                categories: categoriesRes.data.categories || categoriesRes.data.items || [],
            };
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load admin products";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const createAdminProductThunk = createAsyncThunk(
    "adminProducts/createAdminProduct",
    async (formData, thunkAPI) => {
        try {
            const res = await api.post("/admin/products", formData);
            return res.data.product;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create product";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const updateAdminProductThunk = createAsyncThunk(
    "adminProducts/updateAdminProduct",
    async ({ id, formData }, thunkAPI) => {
        try {
            const res = await api.put(`/admin/products/${id}`, formData);
            return res.data.product;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update product";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const deleteAdminProductThunk = createAsyncThunk(
    "adminProducts/deleteAdminProduct",
    async (id, thunkAPI) => {
        try {
            await api.delete(`/admin/products/${id}`);
            return id;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete product";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    items: [],
    categories: [],
    status: "idle",
    error: null,
    submitStatus: "idle",
    submitError: null,
    deleteStatus: "idle",
    deleteError: null,
};

const adminProductsSlice = createSlice({
    name: "adminProducts",
    initialState,
    reducers: {
        clearAdminProductsError(state) {
            state.error = null;
        },
        clearAdminProductSubmitState(state) {
            state.submitStatus = "idle";
            state.submitError = null;
        },
        clearAdminProductDeleteState(state) {
            state.deleteStatus = "idle";
            state.deleteError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminProductsThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchAdminProductsThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.categories = action.payload.categories;
                state.error = null;
            })
            .addCase(fetchAdminProductsThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load admin products";
            })

            .addCase(createAdminProductThunk.pending, (state) => {
                state.submitStatus = "loading";
                state.submitError = null;
            })
            .addCase(createAdminProductThunk.fulfilled, (state, action) => {
                state.submitStatus = "succeeded";
                state.submitError = null;
                state.items.unshift(action.payload);
            })
            .addCase(createAdminProductThunk.rejected, (state, action) => {
                state.submitStatus = "failed";
                state.submitError = action.payload || "Failed to create product";
            })

            .addCase(updateAdminProductThunk.pending, (state) => {
                state.submitStatus = "loading";
                state.submitError = null;
            })
            .addCase(updateAdminProductThunk.fulfilled, (state, action) => {
                state.submitStatus = "succeeded";
                state.submitError = null;
                state.items = state.items.map((item) =>
                    item.id === action.payload.id ? action.payload : item
                );
            })
            .addCase(updateAdminProductThunk.rejected, (state, action) => {
                state.submitStatus = "failed";
                state.submitError = action.payload || "Failed to update product";
            })

            .addCase(deleteAdminProductThunk.pending, (state) => {
                state.deleteStatus = "loading";
                state.deleteError = null;
            })
            .addCase(deleteAdminProductThunk.fulfilled, (state, action) => {
                state.deleteStatus = "succeeded";
                state.deleteError = null;
                state.items = state.items.filter((item) => item.id !== action.payload);
            })
            .addCase(deleteAdminProductThunk.rejected, (state, action) => {
                state.deleteStatus = "failed";
                state.deleteError = action.payload || "Failed to delete product";
            });
    },
});

export const {
    clearAdminProductsError,
    clearAdminProductSubmitState,
    clearAdminProductDeleteState,
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;

export const selectAdminProducts = (state) => state.adminProducts.items;
export const selectAdminProductCategories = (state) => state.adminProducts.categories;
export const selectAdminProductsStatus = (state) => state.adminProducts.status;
export const selectAdminProductsError = (state) => state.adminProducts.error;
export const selectAdminProductSubmitStatus = (state) => state.adminProducts.submitStatus;
export const selectAdminProductSubmitError = (state) => state.adminProducts.submitError;
export const selectAdminProductDeleteStatus = (state) => state.adminProducts.deleteStatus;
export const selectAdminProductDeleteError = (state) => state.adminProducts.deleteError;