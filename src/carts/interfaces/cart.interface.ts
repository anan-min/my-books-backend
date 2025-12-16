export const SHIPPING_COST = 100;

export interface Cart { 
    items: CartItem[];
}

export interface CartItem {
    _id: string; 
    qty: number;
}    



export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  messages: string[];
}


export interface CheckoutSummary {
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}

export interface CartItemDisplay {
  bookId: string;
  bookTitle: string;
  bookPrice: number; 
  bookQty: number; 
}



export interface AddItemResponse {
  cartId: string;
  cart: Cart;
}


export interface GetCartResponse {
  cartId: string; 
  cartDisplay : CartItemDisplay[];
  cart: Cart;
  cartSummary: CartSummary;
}

export interface CheckoutSummaryResponse {
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}