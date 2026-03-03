import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../shared/api/client"; // we will create this path in step 3
import { saveToken, clearToken, getToken  } from "./authStorage";

// ✅ Async thunk = an async action (API call)
export const loginThunk = createAsyncThunk(
    "auth/login",
    async ({ email, password }, thunkAPI) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            return res.data; // expected: { ok:true, token, user }
        } catch (err) {
            // Always return a readable error message
            const msg =
                err?.response?.data?.message || err?.message || "Login failed";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const signupThunk = createAsyncThunk(
    "auth/signup",
    async ({ full_name, email, password }, thunkAPI) => {
        try {
            const res = await api.post("/auth/signup", { full_name, email, password });
            return res.data; // expected: { ok:true, user } (token later if you want)
        } catch (err) {
            const msg =
                err?.response?.data?.message || err?.message || "Signup failed";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

export const loadMeThunk = createAsyncThunk(
    "auth/loadMe",
    async (_, thunkAPI) => {
        try {
            const token = getToken();
            if (!token) return { token: null, user: null };

            // token will be attached via interceptor
            const res = await api.get("/auth/me");
            return { token, user: res.data.user };
        } catch (err) {
            // token invalid/expired or server error
            const msg =
                err?.response?.data?.message || err?.message || "Unauthorized";
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

const initialState = {
    user: null,         // logged in user data
    token: null,        // JWT string
    status: "idle",     // idle | loading | succeeded | failed
    error: null,        // error message for UI
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    // ✅ reducers = synchronous state changes
    reducers: {
        setToken(state, action) {
            state.token = action.payload;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = null;

            clearToken();
        },
        clearAuthError(state) {
            state.error = null;
        },
    },

    // ✅ extraReducers = reactions to async thunks (pending/fulfilled/rejected)
    extraReducers: (builder) => {
        builder
            // ---- LOGIN ----
            .addCase(loginThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.token = action.payload.token;
                state.user = action.payload.user;

                saveToken(action.payload.token);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Login failed";
            })

            // ---- SIGNUP ----
            .addCase(signupThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(signupThunk.fulfilled, (state, action) => {
                state.status = "succeeded";
                // signup currently returns { user } only
                state.user = action.payload.user;
            })
            .addCase(signupThunk.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || "Signup failed";
            })

            //Load ME
            .addCase(loadMeThunk.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loadMeThunk.fulfilled, (state, action) => {
                // If no token, just stay logged out
                if (!action.payload.token) {
                    state.status = "idle";
                    state.token = null;
                    state.user = null;
                    return;
                }

                state.status = "succeeded";
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loadMeThunk.rejected, (state, action) => {
                state.status = "failed";
                state.user = null;
                state.token = null;
                state.error = action.payload || "Unauthorized";

                // token is bad → remove it
                clearToken();
            });

    },
});

export const { setToken, logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;