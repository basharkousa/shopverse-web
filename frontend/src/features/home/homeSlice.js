import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client";

export const fetchHomeDataThunk = createAsyncThunk(
    "home/fetchData",
    async (_, thunkAPI) => {
        try {
            const [catsRes, featuredRes, newRes] = await Promise.all([
                api.get("/categories"),
                api.get("/products", { params: { sort: "topRated", limit: 4, page: 1 } }),
                api.get("/products", { params: { sort: "newest", limit: 4, page: 1 } }),
            ]);

            return {
                categories: catsRes.data.items || [],
                featured: featuredRes.data.items || [],
                newArrivals: newRes.data.items || [],
            };
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Failed to load home data";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    categories: [],
    featured: [],
    newArrivals: [],
    status: "idle",
    error: null,
};

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchHomeDataThunk.pending, (s) => {
            s.status = "loading";
            s.error = null;
        });
        b.addCase(fetchHomeDataThunk.fulfilled, (s, a) => {
            s.status = "succeeded";
            s.categories = a.payload.categories;
            s.featured = a.payload.featured;
            s.newArrivals = a.payload.newArrivals;
        });
        b.addCase(fetchHomeDataThunk.rejected, (s, a) => {
            s.status = "failed";
            s.error = a.payload || "Failed to load home data";
            s.categories = [];
            s.featured = [];
            s.newArrivals = [];
        });
    },
});

export default homeSlice.reducer;