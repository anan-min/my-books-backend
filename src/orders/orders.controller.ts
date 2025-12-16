import { Body, Controller, InternalServerErrorException } from '@nestjs/common';
import { Post } from '@nestjs/common'
import { OrdersService } from './orders.service';
import { CreateOrderRequestDto } from './dtos/create-order.dto'
import { CreateOrderResponse } from './interfaces/orders.interface';



@Controller('orders')
export class OrdersController {

    // create order 
    constructor (private readonly ordersService: OrdersService) {}

    @Post('create')
    async createOrder(
        @Body() body: CreateOrderRequestDto
    ): Promise<CreateOrderResponse> {
        const order = await this.ordersService.createOrder(body.cartId, body.shippingAddress);

        if (!order) {
            throw new InternalServerErrorException("Failed to create order");
        }

        return {
            orderId: order._id.toString(),
            items: order.items,
            totalPrice: order.totalPrice,
            shippingAddress: order.shippingAddress,
            status: order.status,
            paymentSessionId: order.paymentSessionId
        }
    }



    
}
