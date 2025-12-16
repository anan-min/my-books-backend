import { Injectable } from '@nestjs/common';
import { Cart, CartItem } from './interfaces/cart.interface';
import { CartsRepository } from './carts.repository';
import { BooksService } from '../books/books.service';
import { v4 as uuidv4 } from 'uuid';
import { CartSummary, CheckoutSummary, CartItemDisplay } from './interfaces/cart.interface';
import { BookDocument } from '../books/schemas/Book.schema';
import { SHIPPING_COST } from '../common/constants';



@Injectable()
export class CartsService {
    constructor(private readonly cartRepository: CartsRepository, private readonly bookService: BooksService)
    {}


    public async addItem(bookId: string, quantity: number, cartId: string | null): Promise<{ cartId: string; cart: Cart } | undefined> {
        const hasEnoughStock = await this.bookService.hasEnoughStock(bookId, quantity);
        if(hasEnoughStock) {

            const cart = await this.cartRepository.getCart(cartId)
            if(!cart) {
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


    public async getCart(cartId: string): Promise<{ cartId: string; cart: Cart; cartDisplay: CartItemDisplay[]; cartSummary: CartSummary } | undefined> {

        // get cart 
        try {
            const cart = await this.cartRepository.getCart(cartId);
            // cart exists
            if( cart ) {
                // fetch books
                const bookIDs = cart.items.map( (item) => item._id );
                const books = await this.bookService.getBooksByIds( bookIDs ) || [];
                const bookMap = this.buildBookMap(books);
    
                // update item cin carts  
                const { removed, reduced, updatedCart } = this.filterCartItems(cart, bookMap);

                const cartRender: CartItemDisplay[] = this.generateCartDisplay(updatedCart.items, bookMap);
                const cartSummary: CartSummary = this.calculateCartSummary(updatedCart.items, bookMap);
    
                return {
                    cartId,
                    cart: updatedCart,
                    cartDisplay: cartRender,
                    cartSummary: cartSummary,
                }
               
            }
        } catch (error) {
            throw error;
        }
    }

    public async generateCheckoutRenderData(cartId: string): Promise<CheckoutSummary | undefined> {
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

    
    public async getCartForOrder(cartId: string): Promise<Cart | null> {
        if(!cartId) return null;
        const cart = await this.cartRepository.getCart(cartId);
        return cart ? cart : null;
    }




    // ----------------
    // HELPER METHODS
    // ----------------


    private  calculateCheckoutData(cart: Cart, booksMap: Map<string, BookDocument>): CheckoutSummary {
        const items = cart.items
        const matchedItems = items.filter( item => booksMap.has(item._id) );
        const totalItems = matchedItems.reduce( (sum, item) => sum + item.qty, 0);
        const totalPrice = matchedItems.reduce( (sum, item) => {
            const book = booksMap.get(item._id);
            return sum + (book ? book.price * item.qty : 0);
        }, 0);
        const shippingCost = SHIPPING_COST; 
        const grandTotal = totalPrice + shippingCost;

        const result: CheckoutSummary = {
            totalItems,
            totalPrice,
            shippingCost,
            grandTotal,
        };
        return result;
    }

   
    private buildBookMap(books: BookDocument[]): Map<string, BookDocument> {
        return new Map(books.map(b => [b._id.toString(), b]));
    }


    // return updated cart would be better tho 
    private filterCartItems(cart: Cart, bookMap: Map<string, BookDocument>) {
        const removed: { _id: string, reason: string }[] = [];
        const reduced: { _id: string, oldQty: number, newQty: number, reason: string}[] = [];
        const updatedItems: CartItem[] = [];
        const updatedCart: Cart = { items: [] };
        
        for (const item of cart.items) {
            const book = bookMap.get(item._id);
            if (!book) {
                removed.push({ _id: item._id, reason: "book not found" });
            } else if (item.qty <= book.stock) {
                updatedItems.push(item);
            }
        }
        updatedCart.items = updatedItems;

        return { removed, reduced, updatedCart };
    }


    private calculateCartSummary(cartItem: CartItem[], bookMap: Map<string, BookDocument>): CartSummary {
        const total_price = cartItem.reduce( (sum, item) => {
            const book = bookMap.get(item._id);
            return sum + (book ? book.price * item.qty : 0);
        }, 0);
        const itemCount = cartItem.reduce( (sum, item) => sum + item.qty, 0);
        const cartSummary: CartSummary = {
            totalItems: itemCount,
            totalPrice: total_price,
            messages: []
        };
        return cartSummary;
    }

    private generateCartDisplay(cartItems: CartItem[], bookMap: Map<string, BookDocument>): CartItemDisplay[] {
        const renderData: CartItemDisplay[] = cartItems.map( item => {
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
