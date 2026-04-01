import { createSlice } from "@reduxjs/toolkit";

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
        setPaymentMethod(state, action) {
            state.method = action.payload || "mock";
        },
        startPayment(state) {
            state.status = "loading";
            state.error = null;
        },
        paymentSucceeded(state, action) {
            state.status = "succeeded";
            state.error = null;
            state.lastPayment = action.payload || null;
        },
        paymentFailed(state, action) {
            state.status = "failed";
            state.error = action.payload || "Payment failed";
        },
        clearPaymentState(state) {
            state.status = "idle";
            state.error = null;
        },
        clearLastPayment(state) {
            state.lastPayment = null;
        },
    },
});

export const {
    setPaymentMethod,
    startPayment,
    paymentSucceeded,
    paymentFailed,
    clearPaymentState,
    clearLastPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;

export const selectPaymentMethod = (state) => state.payment.method;
export const selectPaymentStatus = (state) => state.payment.status;
export const selectPaymentError = (state) => state.payment.error;
export const selectLastPayment = (state) => state.payment.lastPayment;