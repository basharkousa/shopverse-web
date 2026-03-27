import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchAdminOrdersThunk = createAsyncThunk(
    "adminOrders/fetchAdminOrders",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/admin/orders");
            return res.data.orders || [];
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load admin orders";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const fetchAdminOrderDetailsThunk = createAsyncThunk(
    "adminOrders/fetchAdminOrderDetails",
    async (id, thunkAPI) => {
        try {
            const res = await api.get(`/admin/orders/${id}`);
            return res.data.order;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load order details";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const updateAdminOrderStatusThunk = createAsyncThunk(
    "adminOrders/updateAdminOrderStatus",
    async ({ id, status }, thunkAPI) => {
        try {
            const res = await api.put(`/admin/orders/${id}/status`, { status });
            return res.data.order;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update order status";
            return thunkAPI.rejectWithValue({ id, message: msg });
        }
    }
);

const initialState = {
    items: [],
    status: "idle",
    error: null,

    selectedOrder: null,
    selectedOrderStatus: "idle",
    selectedOrderError: null,

    updateStatusById: {},
    updateErrorById: {},
};

const adminOrdersSlice = createSlice({
    name: "adminOrders",
    initialState,
    reducers: {
        clearAdminOrdersError(state) {
            state.error = null;
        },
        clearAdminOrderRowError(state, action) {
            delete state.updateErrorById[action.payload];
        },
        clearSelectedAdminOrder(state) {
            state.selectedOrder = null;
            state.selectedOrderStatus = "idle";
            state.selectedOrderError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminOrdersThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchAdminOrdersThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchAdminOrdersThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load admin orders";
            })

            .addCase(fetchAdminOrderDetailsThunk.pending, (state) => {
                state.selectedOrderStatus = "loading";
                state.selectedOrderError = null;
            })
            .addCase(fetchAdminOrderDetailsThunk.fulfilled, (state, action) => {
                state.selectedOrderStatus = "succeeded";
                state.selectedOrder = action.payload;
                state.selectedOrderError = null;
            })
            .addCase(fetchAdminOrderDetailsThunk.rejected, (state, action) => {
                state.selectedOrderStatus = "failed";
                state.selectedOrderError = action.payload || "Failed to load order details";
            })

            .addCase(updateAdminOrderStatusThunk.pending, (state, action) => {
                const id = action.meta.arg.id;
                state.updateStatusById[id] = "loading";
                state.updateErrorById[id] = null;
            })
            .addCase(updateAdminOrderStatusThunk.fulfilled, (state, action) => {
                const updated = action.payload;
                state.updateStatusById[updated.id] = "succeeded";
                state.updateErrorById[updated.id] = null;

                state.items = state.items.map((item) =>
                    item.id === updated.id ? { ...item, status: updated.status } : item
                );

                if (state.selectedOrder?.id === updated.id) {
                    state.selectedOrder = {
                        ...state.selectedOrder,
                        status: updated.status,
                    };
                }
            })
            .addCase(updateAdminOrderStatusThunk.rejected, (state, action) => {
                const payload = action.payload || {};
                const id = payload.id ?? action.meta.arg.id;
                state.updateStatusById[id] = "failed";
                state.updateErrorById[id] = payload.message || "Failed to update order status";
            });
    },
});

export const {
    clearAdminOrdersError,
    clearAdminOrderRowError,
    clearSelectedAdminOrder,
} = adminOrdersSlice.actions;

export default adminOrdersSlice.reducer;

export const selectAdminOrders = (state) => state.adminOrders.items;
export const selectAdminOrdersStatus = (state) => state.adminOrders.status;
export const selectAdminOrdersError = (state) => state.adminOrders.error;

export const selectSelectedAdminOrder = (state) => state.adminOrders.selectedOrder;
export const selectSelectedAdminOrderStatus = (state) => state.adminOrders.selectedOrderStatus;
export const selectSelectedAdminOrderError = (state) => state.adminOrders.selectedOrderError;

export const selectAdminOrderUpdateStatusById = (state) => state.adminOrders.updateStatusById;
export const selectAdminOrderUpdateErrorById = (state) => state.adminOrders.updateErrorById;