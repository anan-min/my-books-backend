import { Injectable } from '@nestjs/common';
import { Cart, CartItem } from './carts.repository';
import { CartsRepository } from './carts.repository';
import { BooksService } from '../books/books.service';
import { v4 as uuidv4 } from 'uuid';
import { BookData } from 'src/books/Book.schema';

const SHIPPING_COST = 100;
export interface CartMeta {
    total_items: number;
    total_price: number;
    shipping_cost: number
    grand_total: number;
    messages: string[];
}

@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository, private readonly bookService: BooksService)
    {}


    async addItem(bookId: string, quantity: number, cartId: string | null): Promise<{ cartId: string; cart: Cart } | undefined> {
        const hasEnoughStock = await this.bookService.hasEnoughStock(bookId, quantity);
        if(hasEnoughStock) {
            const IsCartExists = await this.cartRepository.getCart(cartId)
            if(!IsCartExists) {
                const newCartId = uuidv4();
                const initialItem: CartItem = {
                    _id: bookId,
                    qty: quantity
                }
                const newCart =  await this.cartRepository.createCart(newCartId, initialItem);
                return { cartId: newCartId, cart: newCart };
            }
        }
    }


    async getCart(cartId: string): Promise<{ cartId: string; cart: Cart; meta: CartMeta } | undefined> {

        // get cart 
        try {
            const cart = await this.cartRepository.getCart(cartId);
            if( cart ) {
                const bookIDs = cart.items.map( (item) => item._id );
                const books: BookData[] = await this.bookService.getBooksByIds( bookIDs ) || [];
                const bookMap = this.buildBookMap(books);
    
                const { removed, updated } = this.filterCartItems(cart, bookMap);
    
                const updatedCart: Cart = {
                    items: updated
                }
    
                const metaData = this.calculateCartMeta(updatedCart.items, bookMap);
    
                return {
                    cartId,
                    cart: updatedCart,
                    meta: metaData,
                }
               
            }
        } catch (error) {
            throw error;
        }
    }

   
    private buildBookMap(books: BookData[]): Map<string, BookData> {
        return new Map(books.map(b => [b._id, b]));
    }


    private filterCartItems(cart: Cart, bookMap: Map<string, BookData>) {
        const removed: { _id: string, reason: string }[] = [];
        const updated: CartItem[] = [];
        for (const item of cart.items) {
            const book = bookMap.get(item._id);
            if (!book) {
                removed.push({ _id: item._id, reason: "book not found" });
            } else if (item.qty <= book.stock) {
                updated.push(item);
            }
        }
        return { removed, updated };
    }


    

    private calculateCartMeta(cartItem: CartItem[], bookMap: Map<string, BookData>): CartMeta {
        const total_price = cartItem.reduce( (sum, item) => {
            const book = bookMap.get(item._id);
            return sum + (book ? book.price * item.qty : 0);
        }, 0);
        const itemCount = cartItem.reduce( (sum, item) => sum + item.qty, 0);
        const shipping_cost = total_price > 0 ? SHIPPING_COST : 0;
        const grand_total = total_price + shipping_cost;

        const metaData: CartMeta = {
            total_items: itemCount,
            total_price: total_price,
            shipping_cost: shipping_cost,
            grand_total: grand_total,
            messages: []
        };
        return metaData;
    }
}
