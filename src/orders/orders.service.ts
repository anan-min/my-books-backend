import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CartsService } from '../carts/carts.service'
import { BooksService } from '../books/books.service';
import { SHIPPING_COST } from '../common/constants';
import { Order, OrderDocument } from './schemas/Order.schema';

@Injectable()
export class OrdersService {
    constructor( 
        private readonly cartsService: CartsService, 
        private readonly booksService: BooksService, 
        private readonly orderRepository: OrdersRepository
    ) {}

    async createOrder(cartId: string, shippingAddress: string): Promise<Order | undefined> {
        // fetch cart from redis 
        const cart =  await this.cartsService.getCartForOrder(cartId);
        // should cart error called from cart service ?


        // fetch books from ids in cart
        const itemIds = cart?.items.map( (item) => item._id ) || [];
        const books = await this.booksService.getBooksByIds( itemIds );
        
        
        // create item from books 
        const bookMap = this.buildBookMap( books || [] );
        
        const orderItems = this.createOrderItemsFromCart( cart, bookMap );
        const totalPrice = this.calculateTotalPrice( orderItems );

        const orderData = {
            items: orderItems,
            totalPrice,
            shippingAddress,
        };

        const createdOrder = await this.orderRepository.createOrder( orderData as any );
        return createdOrder;
    }

    // -------------
    // HELPER METHOD 
    // -------------

    private buildBookMap(books: any[]): Map<string, any> {
        return new Map(books.map(b => [b._id.toString(), b]));
    }

    private createOrderItemsFromCart(cart: any, bookMap: Map<string, any>): any[] {
        if(!cart) return [];
        const items = cart.items;
        const orderItems = items.map( (item) => {
            const book = bookMap.get(item._id);
            return {
                _id: book ? book._id : null,
                title: book ? book.title : 'Unknown Title',
                price: book ? book.price : 0,
                qty: item.qty,
            }
        });
        return orderItems;
    }

    private calculateTotalPrice(orderItems: any[]): number {
        return orderItems.reduce( (sum, item) => sum + (item.price * item.qty), 0) + SHIPPING_COST;
    }

}
