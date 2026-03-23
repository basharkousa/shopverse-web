import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchMyOrdersThunk = createAsyncThunk(
    "orders/fetchMyOrders",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/orders/my");
            return res.data.orders || [];
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Failed to load orders";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    items: [],
    status: "idle",
    error: null,
};

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        clearOrdersError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyOrdersThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchMyOrdersThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load orders";
            });
    },
});

export const { clearOrdersError } = ordersSlice.actions;

export default ordersSlice.reducer;

export const selectOrders = (state) => state.orders.items;
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrdersError = (state) => state.orders.error;