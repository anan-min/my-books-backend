import { BadRequestException, Controller, Get } from '@nestjs/common';
import { Body, Post, Patch, Param} from '@nestjs/common'
import { plainToInstance } from 'class-transformer';

import { CartsService} from './carts.service';

import { AddItemRequestDto, AddItemResponseDto } from './dtos/add-item.dto';
import  { GetCartResponseDto } from './dtos/get-cart.dto';
import { CheckoutSummaryDto } from './dtos/checkout-summary.dto';


@Controller('carts')
export class CartsController {

    constructor(private cartsService: CartsService) 
    {}

    @Post('add')
    // @UsePipes(new ValidationPipe({ transform: true }))
    async addItemToCart(
        @Body() body: AddItemRequestDto
    ): Promise<AddItemResponseDto> {
        const cartId = body.cartId ? body.cartId : null;
        const result = await this.cartsService.addItem(body.bookId, body.quantity, cartId);
        return plainToInstance(AddItemResponseDto, result);
    }


    @Patch(':cartId')
    async getCart(@Param('cartId') cartId: string): Promise<GetCartResponseDto> { 
        if (!cartId) {
            throw new BadRequestException("Cart ID is required");
        }
        try {
            const result = await this.cartsService.getCart(cartId);
            return plainToInstance(GetCartResponseDto, result);
        } catch (error) {
            throw new Error("Server Error")
        }
    }

    @Get(':cartId')
    async getCheckoutSummary(@Param('cartId') cartId: string): Promise<CheckoutSummaryDto> { 
        // return checkout render data
        if (!cartId) {
            throw new BadRequestException("Cart ID is required")
        }

        try {
            const result = await this.cartsService.generateCheckoutRenderData(cartId);
            return plainToInstance(CheckoutSummaryDto, result);
        } catch (error) {
            throw new Error("Server Error")
        }
    }
 
}
