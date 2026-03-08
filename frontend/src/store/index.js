import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import authReducer from "../features/auth/authSlice";
import productsReducer from "../features/products/productsSlice";
import productDetailsReducer from "../features/products/productDetailsSlice.js";
import relatedProductsReducer from "../features/products/relatedProductsSlice.js";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
        products: productsReducer,
        productDetails: productDetailsReducer,
        relatedProducts: relatedProductsReducer,
    },
});
