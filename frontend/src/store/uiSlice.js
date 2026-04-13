import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    appName: "ShopVerse",
    toasts: [],
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setAppName(state, action) {
            state.appName = action.payload;
        },

        showToast: {
            reducer(state, action) {
                state.toasts.push(action.payload);
            },
            prepare(payload) {
                return {
                    payload: {
                        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                        type: payload?.type || "info",
                        message: payload?.message || "",
                        duration: payload?.duration ?? 3000,
                    },
                };
            },
        },

        removeToast(state, action) {
            state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
        },

        clearToasts(state) {
            state.toasts = [];
        },
    },
});

export const { setAppName, showToast, removeToast, clearToasts } =
    uiSlice.actions;

export default uiSlice.reducer;

export const selectAppName = (state) => state.ui.appName;
export const selectToasts = (state) => state.ui.toasts;