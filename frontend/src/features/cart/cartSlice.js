import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;

            const existingItem = state.items.find((item) => item.id === product.id);

            if (existingItem) {
                if (
                    typeof existingItem.stock_qty === 'number' &&
                    existingItem.qty < existingItem.stock_qty
                ) {
                    existingItem.qty += 1;
                }
            } else {
                state.items.push({
                    id: product.id,
                    title: product.title,
                    price_cents: product.price_cents,
                    image_url: product.image_url,
                    qty: 1,
                    stock_qty: product.stock_qty,
                });
            }
        },

        removeFromCart: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter((item) => item.id !== productId);
        },

        updateQty: (state, action) => {
            const { productId, qty } = action.payload;
            const item = state.items.find((item) => item.id === productId);

            if (!item) return;

            const parsedQty = Number(qty);

            if (Number.isNaN(parsedQty) || parsedQty < 1) return;

            if (typeof item.stock_qty === 'number' && parsedQty > item.stock_qty) {
                item.qty = item.stock_qty;
                return;
            }

            item.qty = parsedQty;
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0);

export const selectSubtotalCents = (state) =>
    state.cart.items.reduce(
        (sum, item) => sum + item.price_cents * item.qty,
        0
    );

export const selectItemSubtotalCents = (productId) => (state) => {
    const item = state.cart.items.find((item) => item.id === productId);
    return item ? item.price_cents * item.qty : 0;
};