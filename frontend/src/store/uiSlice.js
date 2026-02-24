import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    appName: "ShopVerse",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setAppName(state, action) {
            state.appName = action.payload;
        },
    },
});

export const { setAppName } = uiSlice.actions;
export default uiSlice.reducer;