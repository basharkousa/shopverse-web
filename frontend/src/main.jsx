import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

import "./index.css";
import App from "./App.jsx";
import { loadMeThunk } from "./features/auth/authSlice";

// ✅ run once on app start
store.dispatch(loadMeThunk());

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);