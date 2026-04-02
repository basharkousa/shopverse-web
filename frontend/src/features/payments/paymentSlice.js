import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const confirmMockPaymentThunk = createAsyncThunk(
    "payment/confirmMockPayment",
    async ({ orderId, card }, thunkAPI) => {
        try {
            const res = await api.post("/payments/mock-confirm", {
                order_id: orderId,
                payment_method: "mock",
                card,
            });

            return res.data;
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Payment failed";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    method: "mock",
    status: "idle",
    error: null,
    lastPayment: null,
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        clearPaymentState(state) {
            state.status = "idle";
            state.error = null;
        },
        clearLastPayment(state) {
            state.lastPayment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(confirmMockPaymentThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.lastPayment = null;
            })
            .addCase(confirmMockPaymentThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.error = null;
                state.lastPayment = action.payload;
            })
            .addCase(confirmMockPaymentThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Payment failed";
            });
    },
});

export const { clearPaymentState, clearLastPayment } = paymentSlice.actions;

export default paymentSlice.reducer;

export const selectPaymentMethod = (state) => state.payment.method;
export const selectPaymentStatus = (state) => state.payment.status;
export const selectPaymentError = (state) => state.payment.error;
export const selectLastPayment = (state) => state.payment.lastPayment;