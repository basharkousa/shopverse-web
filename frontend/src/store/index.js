import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import authReducer from "../features/auth/authSlice";
import productsReducer from "../features/products/productsSlice";
import productDetailsReducer from "../features/products/productDetailsSlice.js";
import relatedProductsReducer from "../features/products/relatedProductsSlice.js";
import homeReducer from "../features/home/homeSlice.js";
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from "../features/orders/ordersSlice";

import adminOverviewReducer from "../features/admin/adminOverviewSlice";
import adminProductsReducer from "../features/admin/adminProductsSlice";
import adminOrdersReducer from "../features/admin/adminOrdersSlice";


export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
        products: productsReducer,
        productDetails: productDetailsReducer,
        relatedProducts: relatedProductsReducer,
        home: homeReducer,
        cart: cartReducer,
        orders: ordersReducer,
        adminOverview: adminOverviewReducer,
        adminProducts: adminProductsReducer,
        adminOrders: adminOrdersReducer,
    },
});
