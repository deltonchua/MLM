import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { CartInterface, CartItemInterface } from '../interfaces/Product';

interface CartSliceInterface {
  cart?: CartInterface;
}

const initialState: CartSliceInterface = {};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartInterface>) => {
      state.cart = action.payload;
    },
    emptyCart: (state) => {
      state.cart = {};
    },
    addCartItem: (state, action: PayloadAction<CartItemInterface>) => {
      if (!state.cart) return;
      const { payload } = action;
      const priceID = payload.priceID;
      const cartItem = state.cart[priceID];
      const quantity = cartItem?.quantity || 0;
      state.cart[priceID] = {
        ...payload,
        quantity: quantity < 50 ? quantity + 1 : quantity,
      };
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      if (!state.cart) return;
      const { payload: priceID } = action;
      const cartItem = state.cart[priceID];
      if (!cartItem) return;
      if (cartItem.quantity === 1) {
        delete state.cart[priceID];
        return;
      }
      state.cart[priceID] = { ...cartItem, quantity: cartItem.quantity - 1 };
    },
  },
});

export const {
  setCart,
  emptyCart,
  addCartItem,
  removeCartItem,
} = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart.cart;

export default cartSlice.reducer;
