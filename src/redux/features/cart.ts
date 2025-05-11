import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  thumbnail: string;
  price: number;
  quantity: number;
  totalPrice: number;
  variants?: {
    name: string;
    value: string;
  }[];
  taxMethod: "Exclusive" | "Inclusive" | "No Tax";
  productTax: {
    type: "Percentage" | "Fixed";
    rate: number;
  } | null;
}

interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  isAdded: boolean;
}

const initialState: CartState = {
  cartItems: [],
  loading: false,
  error: null,
  isAdded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === newItem.productId,
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
        existingItem.variants = newItem.variants;
        existingItem.taxMethod = newItem.taxMethod;
        existingItem.productTax = {
          type: newItem.productTax?.type || "Percentage",
          rate: newItem.productTax?.rate || 0,
        };
      } else {
        state.cartItems.push(newItem);
      }

      state.isAdded = true;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload,
      );
    },
    changeItemQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
        variants?: {
          name: string;
          value: string;
        }[];
      }>,
    ) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.totalPrice = existingItem.price * quantity;
        existingItem.variants = action.payload.variants;
      }
    },
    resetAddedFlag: (state) => {
      state.isAdded = false;
    },
    removeAllFromCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  changeItemQuantity,
  resetAddedFlag,
  removeAllFromCart,
} = cartSlice.actions;

const cartReducer = cartSlice.reducer;

export default cartReducer;

export const selectCartItems = (state: { cart: CartState }) =>
  state.cart.cartItems;
