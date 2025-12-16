import { BadRequestException, InternalServerErrorException,Controller, Get } from '@nestjs/common';
import { Body, Post, Patch, Param} from '@nestjs/common'
import { CartsService} from './carts.service';
import { AddItemRequestDto } from './dtos/add-item.dto';
import { AddItemResponse, GetCartResponse, CheckoutSummaryResponse } from './interfaces/cart.interface';


@Controller('carts')
export class CartsController {

    constructor(private cartsService: CartsService) 
    {}

    @Post('add')
    // @UsePipes(new ValidationPipe({ transform: true }))
    async addItemToCart(
        @Body() body: AddItemRequestDto
    ): Promise<AddItemResponse> {
        const cartId = body.cartId ? body.cartId : null;
        const result = await this.cartsService.addItem(body.bookId, body.quantity, cartId);


        if (!result) {
            throw new InternalServerErrorException("Failed to add item to cart");
        }

        return {
            cartId: result.cartId,
            cart: result.cart
        }
    }


    @Patch(':cartId')
    async getCart(@Param('cartId') cartId: string): Promise<GetCartResponse> { 
        if (!cartId) {
            throw new BadRequestException("Cart ID is required");
        }
        try {
            const result = await this.cartsService.getCart(cartId);

            if (!result) {
                throw new InternalServerErrorException("Failed to get cart");
            }

            return {
                cartId: result.cartId,
                cart: result.cart,
                cartDisplay: result.cartDisplay,
                cartSummary: result.cartSummary
            }

        } catch (error) {
            throw new InternalServerErrorException("Server Error")
        }
    }

    @Get(':cartId')
    async getCheckoutSummary(@Param('cartId') cartId: string): Promise<CheckoutSummaryResponse> { 
        // return checkout render data
        if (!cartId) {
            throw new BadRequestException("Cart ID is required")
        }

        try {
            const result = await this.cartsService.generateCheckoutRenderData(cartId);

            if (!result) {
                throw new InternalServerErrorException("Failed to get checkout summary");
            }

            return {
                totalItems: result.totalItems,
                totalPrice: result.totalPrice,
                shippingCost: result.shippingCost,
                grandTotal: result.grandTotal
            }
            
        } catch (error) {
            throw new InternalServerErrorException("Server Error")
        }
    }
 
}
