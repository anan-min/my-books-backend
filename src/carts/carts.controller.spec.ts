import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { BadRequestException } from '@nestjs/common';
import { AddItemRequestDto } from './dtos/add-item.dto';
import { Cart, CartSummary, CheckoutSummary } from './interfaces/cart.interface';
import { CheckoutSummaryDto } from './dtos/checkout-summary.dto';
import { GetCartResponseDto } from './dtos/get-cart.dto';
import e from 'express';


  describe('CartsController', () => {
    let controller: CartsController;
    let mockCartService: Partial<CartsService>;

    beforeEach(async () => {

      mockCartService = {
        addItem: jest.fn(),
        getCart: jest.fn(),
        generateCheckoutRenderData: jest.fn()
      }
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CartsController],
        providers: [
          {
            provide: CartsService,
            useValue: mockCartService
          }
        ]
      }).compile();

      controller = module.get<CartsController>(CartsController);
    });


    describe('addItemToCart', () => { 

      it('controller should be defined', () => {
        expect(controller).toBeDefined();
      });
  
      it('should set carId to null if not send from user', async () => {
        const input: AddItemRequestDto = {
          bookId: "valid_book_id",
          quantity: 1,
        }
  
        const cartId: string = "some cart id"
        const cart: Cart = {
          items: [
            {
              _id: input.bookId,
              qty: input.quantity
            }
          ]
        }
        
  
        mockCartService.addItem = jest.fn().mockResolvedValue({cartId, cart})
        await controller.addItemToCart(input);
        expect(mockCartService.addItem).toHaveBeenCalledTimes(1);
        expect(mockCartService.addItem).toHaveBeenCalledWith(input.bookId, input.quantity, null);
        
      });
      
  
      it('should set carId to null if not send from user', async () => {
        const input: AddItemRequestDto = {
          bookId: "valid_book_id",
          quantity: 1,
        }
  
        const cartId: string = "some cart id"
        const cart: Cart = {
          items: [
            {
              _id: input.bookId,
              qty: input.quantity
            }
          ]
        }
  
        mockCartService.addItem = jest.fn().mockResolvedValue({cartId, cart})
        const result = await controller.addItemToCart(input);
        const {cartId: returnedCartId, cart: returnedCart} = result;
        expect(returnedCartId).toBe(cartId);
        expect(returnedCart).toBe(returnedCart);
        expect(mockCartService.addItem).toHaveBeenCalledTimes(1);
        expect(mockCartService.addItem).toHaveBeenCalledWith(input.bookId, input.quantity, null);
        
      });
    });



    // should check cartId if 
    describe('getCart', () => {
      it('should return cartId cart cartDisplay and cartSummary', async () => {
        // should return cartId cart and meta data for render 
        // should handle error from service error 

        const cartId = "validCartId"
        const cart: Cart = {
          items: [
            {
              _id: "book-id-1",
              qty: 1
            }
          ]
        }
        const cartSummary: CartSummary = {
          totalItems: 1, 
          totalPrice: 20,
          messages: [] 
        }

        const cartDisplay = [
          {
            bookId: "book-id-1",
            bookTitle: "Some Book",
            bookPrice: 20,
            bookQty: 1
          }
        ]

        const expectedOutput: GetCartResponseDto = {
          cartId,
          cart,
          cartDisplay,
          cartSummary
        }

        mockCartService.getCart = jest.fn().mockResolvedValue({cartId, cart, cartDisplay, cartSummary})
        const result = await controller.getCart(cartId);
        expect(result).toEqual(expectedOutput);
      })

      it('should handle errorn when service error occurs', async () => {
        const cartId = "validCartId"
        mockCartService.getCart = jest.fn().mockRejectedValue(new Error("cart service error etc"))
        await expect(controller.getCart(cartId)).rejects.toThrow(new Error("Server Error"))
      })
  
      it('should throw error if cartid is null', async () => { 
        const cartId = ""
        mockCartService.getCart = jest.fn() 
        await expect(controller.getCart(cartId)).rejects.toThrow(new BadRequestException("Cart ID is required"))
      })

    })


    describe('getCartFromCheckout', () => {
      // should return error if cartId is empty 
      // should generate proper checkout information 
      // should handle error from service and return as server error 

      it('should return error if catId is empty', async () => {
        const cartId = ""
        mockCartService.generateCheckoutRenderData = jest.fn() 
        await expect(controller.getCheckoutSummary(cartId)).rejects.toThrow(new BadRequestException("Cart ID is required"))
        expect(mockCartService.generateCheckoutRenderData).not.toHaveBeenCalled()
      });

      it('should generate proper checkout information', async () => {

        const cartId = "cartId"


        const serviceResult: CheckoutSummary = {
          totalItems: 1, 
          totalPrice: 50.12,
          shippingCost: 100,
          grandTotal: 150.12
        }

        const expectedOutput: CheckoutSummaryDto = {
          totalItems: 1, 
          totalPrice: 50.12,
          shippingCost: 100,
          grandTotal: 150.12
        }

        mockCartService.generateCheckoutRenderData = jest.fn().mockResolvedValue(serviceResult);
        const result = await controller.getCheckoutSummary(cartId);
        expect(result).toEqual(expectedOutput);

      });

      it('should handle error from service and return as server error', async () => {
        const cartId = "cartId"
        mockCartService.generateCheckoutRenderData = jest.fn().mockRejectedValue(new Error("some service error"));
        await expect( controller.getCheckoutSummary(cartId) ).rejects.toThrow(new Error("Server Error"))
      });
      
    })
    
  });
