import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client.js";

export const fetchAdminOverviewThunk = createAsyncThunk(
    "adminOverview/fetchOverview",
    async (_, thunkAPI) => {
        try {
            const res = await api.get("/admin/overview");
            return res.data.overview;
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load admin overview";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    overview: null,
    status: "idle",
    error: null,
};

const adminOverviewSlice = createSlice({
    name: "adminOverview",
    initialState,
    reducers: {
        clearAdminOverviewError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminOverviewThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchAdminOverviewThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.overview = action.payload;
                state.error = null;
            })
            .addCase(fetchAdminOverviewThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Failed to load admin overview";
            });
    },
});

export const { clearAdminOverviewError } = adminOverviewSlice.actions;

export default adminOverviewSlice.reducer;

export const selectAdminOverview = (state) => state.adminOverview.overview;
export const selectAdminOverviewStatus = (state) => state.adminOverview.status;
export const selectAdminOverviewError = (state) => state.adminOverview.error;