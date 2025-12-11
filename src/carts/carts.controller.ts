import { BadRequestException, Controller, Get } from '@nestjs/common';
import { Body, Post, Patch, Param} from '@nestjs/common'
import { AddItemInputDto, AddItemOutputDto } from './cart.dto';
import { CartsService} from './carts.service';
import { plainToInstance } from 'class-transformer';
import { GetCartInputDto, GetCartOutputDto } from './cart.dto';


@Controller('carts')
export class CartsController {

    constructor(private cartsService: CartsService) 
    {}

    @Post('add')
    // @UsePipes(new ValidationPipe({ transform: true }))
    async addItemToCart(
        @Body() body: AddItemInputDto
    ) {
        const cartId = body.cartId ? body.cartId : null;
        const result = await this.cartsService.addItem(body.bookId, body.quantity, cartId);
        return plainToInstance(AddItemOutputDto, result);
    }


    @Patch(':cartId')
    async getCart(@Param('cartId') cartId: string) { 
        if (!cartId) {
            throw new BadRequestException("Cart ID is required");
        }
        try {
            const result = await this.cartsService.getCart(cartId);
            return plainToInstance(GetCartOutputDto, result);
        } catch (error) {
            throw new Error("Server Error")
        }
    }

    @Get(':cartId')
    async getCheckoutSummary(@Param('cartId') cartId: string) { 
        // return checkout render data
        if (!cartId) {
            throw new BadRequestException("Cart ID is required")
        }

        try {
            return await this.cartsService.generateCheckoutRenderData(cartId);
        } catch (error) {
            throw new Error("Server Error")
        }
    }
 
}
