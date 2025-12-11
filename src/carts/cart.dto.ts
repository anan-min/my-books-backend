import { IsNumber, IsPositive, IsString, IsOptional } from "class-validator";
import type { Cart } from "./carts.repository";
import { Expose } from "class-transformer";




export const SHIPPING_COST = 100;

export interface CartMeta {
  totalItems: number;
  totalPrice: number;
  messages: string[];
}


export interface CheckoutMeta {
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}

export interface CartItemRenderData {
  bookId: string;
  bookTitle: string;
  bookPrice: number; 
  bookQty: number; 
}




export class AddItemOutputDto {
  @Expose()
  @IsString()
  cartId: string;
  
  @Expose()
  cart: Cart;
}

export class AddItemInputDto {
  @Expose()
  @IsString()
  bookId: string;

  @Expose()
  @IsNumber()
  @IsPositive()
  quantity: number;
  
  @Expose()
  @IsOptional()
  cartId?: string | null;
}


export class GetCartInputDto {
  @Expose()
  @IsOptional()
  @IsString()
  cartId?: string | null;
}


export class GetCartOutputDto { 
  @Expose()
  @IsString()
  cartId: string;

  @Expose()
  cartRender : CartItemRenderData[];

  @Expose()
  cart: Cart;

  @Expose()
  meta: CartMeta;
}


// export interface CheckoutMeta {
//   totalItems: number;
//   totalPrice: number;
//   shippingCost: number;
//   grandTotal: number;
// }


export interface GetCartFromCheckoutDto {
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}