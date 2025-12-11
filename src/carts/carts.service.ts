import { Injectable } from '@nestjs/common';
import { Cart, CartItem } from './carts.repository';
import { CartsRepository } from './carts.repository';
import { BooksService } from '../books/books.service';
import { v4 as uuidv4 } from 'uuid';
import { BookData } from 'src/books/Book.schema';
import { CartMeta, CheckoutMeta, SHIPPING_COST } from './cart.dto';
import { CartItemRenderData } from './cart.dto';



@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository, private readonly bookService: BooksService)
    {}


    public async addItem(bookId: string, quantity: number, cartId: string | null): Promise<{ cartId: string; cart: Cart } | undefined> {
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


    public async getCart(cartId: string): Promise<{ cartId: string; cart: Cart; cartRender: CartItemRenderData[]; meta: CartMeta } | undefined> {

        // get cart 
        try {
            const cart = await this.cartRepository.getCart(cartId);
            if( cart ) {
                const bookIDs = cart.items.map( (item) => item._id );
                const books: BookData[] = await this.bookService.getBooksByIds( bookIDs ) || [];
                const bookMap = this.buildBookMap(books);
    
                const { removed, reduced, updated } = this.filterCartItems(cart, bookMap);
    
                const updatedCart: Cart = {
                    items: updated
                }

                const cartRender: CartItemRenderData[] = this.generateCartRenderData(updatedCart.items, bookMap);
                const metaData: CartMeta = this.calculateCartMeta(updatedCart.items, bookMap);
    
                return {
                    cartId,
                    cart: updatedCart,
                    cartRender: cartRender,
                    meta: metaData,
                }
               
            }
        } catch (error) {
            throw error;
        }
    }

    public async generateCheckoutRenderData(cartId: string): Promise<CheckoutMeta | undefined> {
        const cart = await this.cartRepository.getCart(cartId);
        if( cart ) {
            const itemsIds = cart.items.map( (item) => item._id );
            const books = await this.bookService.getBooksByIds(itemsIds);
            const booksMap = this.buildBookMap(books);
            return this.calculateCheckoutData(cart, booksMap)
        }
        // fetch cart from redis 
        // cart exists -> render checkout data 
        // no exists return null / throw error to redirect to cart page
    }


    private  calculateCheckoutData(cart: Cart, booksMap: Map<string, BookData>): CheckoutMeta {
        const items = cart.items
        const matchedItems = items.filter( item => booksMap.has(item._id) );
        const totalItems = matchedItems.reduce( (sum, item) => sum + item.qty, 0);
        const totalPrice = matchedItems.reduce( (sum, item) => {
            const book = booksMap.get(item._id);
            return sum + (book ? book.price * item.qty : 0);
        }, 0);
        const shippingCost = SHIPPING_COST; 
        const grandTotal = totalPrice + shippingCost;
        const result: CheckoutMeta = {
            totalItems,
            totalPrice,
            shippingCost,
            grandTotal,
        };
        return result;
    }

   
    private buildBookMap(books: BookData[]): Map<string, BookData> {
        return new Map(books.map(b => [b._id, b]));
    }


    private filterCartItems(cart: Cart, bookMap: Map<string, BookData>) {
        const removed: { _id: string, reason: string }[] = [];
        const reduced: { _id: string, oldQty: number, newQty: number, reason: string}[] = [];
        const updated: CartItem[] = [];
        
        for (const item of cart.items) {
            const book = bookMap.get(item._id);
            if (!book) {
                removed.push({ _id: item._id, reason: "book not found" });
            } else if (item.qty <= book.stock) {
                updated.push(item);
            }
        }
        return { removed, reduced, updated };
    }


    private calculateCartMeta(cartItem: CartItem[], bookMap: Map<string, BookData>): CartMeta {
        const total_price = cartItem.reduce( (sum, item) => {
            const book = bookMap.get(item._id);
            return sum + (book ? book.price * item.qty : 0);
        }, 0);
        const itemCount = cartItem.reduce( (sum, item) => sum + item.qty, 0);
        const metaData: CartMeta = {
            totalItems: itemCount,
            totalPrice: total_price,
            messages: []
        };
        return metaData;
    }

    private generateCartRenderData(cartItems: CartItem[], bookMap: Map<string, BookData>): CartItemRenderData[] {
        const renderData: CartItemRenderData[] = cartItems.map( item => {
            const book = bookMap.get(item._id);
            return {
                bookId: item._id,
                bookTitle: book ? book.title : "Unknown",
                bookPrice: book ? book.price : 0,
                bookQty: item.qty
            }
        });
        return renderData;
    }



}
