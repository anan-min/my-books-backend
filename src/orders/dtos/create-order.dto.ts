import { Exclude, Expose } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class CreateOrderRequestDto { 
    // shipping address
    // cartId 

    @IsString()
    cartId: string;

    @IsString()
    shippingAddress: string;
}

export interface Item  {
    _id: string;
    title: string;
    price: number;
    qty: number;
}


