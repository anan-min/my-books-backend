import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { BooksService } from '../books/books.service';
import { Cart } from './interfaces/cart.interface';
import { CartsRepository } from './carts.repository';
import { CartItemDisplay, CheckoutSummary } from './interfaces/cart.interface';
import { SHIPPING_COST } from '../common/constants';

describe('CartsService', () => {
  let service: CartsService;
  let mockCartRepo: Partial<CartsRepository>;
  let mockBooksService: Partial<BooksService>;



  beforeEach(async () => {
    mockCartRepo = {
      getCart: jest.fn(),
      createCart: jest.fn(),
    }

    mockBooksService = {
      getDefaultBooks: jest.fn(),
      hasEnoughStock: jest.fn(),
      getBooksByIds: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService, {
          provide: CartsRepository,
          useValue: mockCartRepo
        },
        {
          provide: BooksService,
          useValue: mockBooksService
        }
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('addItem scenario 1 (no cart / enough item in stock)', () => {

    beforeEach(async () => {
      mockCartRepo.getCart = jest.fn().mockResolvedValue(null)
      mockBooksService.hasEnoughStock = jest.fn().mockResolvedValue(true)
    })

    it('should create a new cart and add the item, return the new cart id', async () => {
      const inputCartId = null
      const qty = 27
      const bookdId = "bookId"
      const expectedCartId = "cartid"
      const expectedCart: Cart = {
        items: [
          {
            _id: bookdId,
            qty: qty
          }
        ]
      };


      mockCartRepo.createCart = jest.fn().mockResolvedValue(expectedCart);
      const result = await service.addItem(bookdId, qty, inputCartId)
      const { cartId, cart } = result!;

      expect(result).toBeDefined();
      expect(cartId).toEqual(expect.any(String));
      expect(cartId).not.toBe(null);
      expect(cart).toEqual(expectedCart);
    });


    it('should call enoughStock(1) getCart(2) createCart(1)', async () => {
      const inputCartId = null
      const qty = 27
      const bookdId = "bookId"
      const expectedCartId = "cartid"
      const expectedCart: Cart = {
        items: [
          {
            _id: bookdId,
            qty: qty
          }
        ]
      };

      mockCartRepo.createCart = jest.fn().mockResolvedValue(expectedCart);
      const result = await service.addItem(bookdId, qty, inputCartId)

      expect(mockCartRepo.getCart).toHaveBeenCalledTimes(1)
      expect(mockCartRepo.createCart).toHaveBeenCalledTimes(1)
      expect(mockBooksService.hasEnoughStock).toHaveBeenCalledTimes(1)
    });

    it('should call enoughStock getCart createCart with correct arguments', async () => {
      const inputCartId = null
      const qty = 27
      const bookdId = "bookId"
      const expectedCartId = "cartid"
      const expectedCart: Cart = {
        items: [
          {
            _id: bookdId,
            qty: qty
          }
        ]
      };


      mockCartRepo.createCart = jest.fn().mockResolvedValue(expectedCart);
      const result = await service.addItem(bookdId, qty, inputCartId)

      expect(mockCartRepo.getCart).toHaveBeenCalledWith(inputCartId);
      expect(mockCartRepo.createCart).toHaveBeenCalledWith(expect.any(String), { _id: bookdId, qty: qty });
      expect(mockBooksService.hasEnoughStock).toHaveBeenCalledWith(bookdId, qty);
    });


    it('should handle errors from repository when creating cart', async () => {
      mockCartRepo.createCart = jest.fn().mockRejectedValue(new Error('Redis error'));

      await expect(service.addItem("bookId", 10, null)).rejects.toThrow('Redis error');
      expect(mockCartRepo.createCart).toHaveBeenCalled();
    });

    it('should handle errors from repository when get cart', async () => {
      mockCartRepo.getCart = jest.fn().mockRejectedValue(new Error('Redis error'));

      await expect(service.addItem("bookId", 10, null)).rejects.toThrow('Redis error');
      expect(mockCartRepo.getCart).toHaveBeenCalled();
    });

    it('should handle erros from service when checking bookstock', async () => {
      mockBooksService.hasEnoughStock = jest.fn().mockRejectedValue(new Error('Service error'));

      await expect(service.addItem("bookId", 10, null)).rejects.toThrow('Service error');
      expect(mockBooksService.hasEnoughStock).toHaveBeenCalled();
    });

  });



  describe('get cart scenario 1 (cart already exists/ enough item in stock)', () => {

    it('should retrieve cart from cart repository using cartid', async () => {
      const cartId = "valid_id"
      const bookId = "valid_id"
      const qty = 2
      const cart: Cart = {
        items: [
          {
            _id: bookId,
            qty: qty
          }
        ]
      };
      const books: any[] = [

      ] 
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      await service.getCart(cartId);
      expect(mockCartRepo.getCart).toHaveBeenCalled();
      expect(mockCartRepo.getCart).toHaveBeenCalledWith(cartId);
    });


    it('should get books based on cartId', async () => {
      const cartId = "valid_id"
      const bookIDs = ["1", "2"]
      const qty = 2
      const cart: Cart = {
        items: [
          {
            _id: bookIDs[0],
            qty: qty
          },
          {
            _id: bookIDs[1],
            qty: qty
          }
        ]
      };
      const books: any[] = [
        {
          _id: bookIDs[0],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
        {
          _id: bookIDs[1],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
      ]


      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books)
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart)

      await service.getCart(cartId);
      expect(mockBooksService.getBooksByIds).toHaveBeenCalled()
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledWith(bookIDs)


    })
    
    it('should not add book that is not found in the stock', async () => {
      // cart include id that is not in the book returned value 
      const cartId = "validId"
      const includeId = "includeId"
      const notIncludeId = "notIncludeId"
      const cart: Cart = {
        items: [
          {
            _id: includeId,
            qty: 1
          },
          {
            _id: notIncludeId,
            qty: 1
          }
        ]
      }

      const books: any[] = [
        {
          _id: includeId,
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
      ]

      const expectedCart: Cart = {
         items: [
          {
            _id: includeId,
            qty: 1
          },
        ]
      }

      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books);
      const result = await service.getCart(cartId);
      expect(result?.cart).toEqual(expectedCart)
    });

    it('should return valid cart data', async () => {
      const cartId = "valid_id"
      const bookIDs = ["1", "2"]
      const qty = 1
      const cart: Cart = {
        items: [
          {
            _id: bookIDs[0],
            qty: qty
          },
          {
            _id: bookIDs[1],
            qty: qty
          }
        ]
      };
      const books: any[] = [
        {
          _id: bookIDs[0],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
        {
          _id: bookIDs[1],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
      ]


      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books)
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart)

      const result = await service.getCart(cartId);
      if( result ) { 
        const {cartId, cart} = result;

        expect(cartId).toBe(cartId);
        expect(cart).toEqual(cart);
      }

    });

    it('should return render data', async () => {
      const cartId = "valid_id"
      const bookIDs = ["1", "2"]
      const qty = 1
      const cart: Cart = {
        items: [
          {
            _id: bookIDs[0],
            qty: qty
          },
          {
            _id: bookIDs[1],
            qty: qty
          }
        ]
      };
      const books: any[] = [
        {
          _id: bookIDs[0],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
        {
          _id: bookIDs[1],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
      ]

      const expectedCartDisplay: CartItemDisplay[] = [ 
        {
          bookId: books[0]._id,
          bookTitle: books[0].title,
          bookPrice: books[0].price,
          bookQty: qty
         
        },
        {
          bookId: books[1]._id,
          bookTitle: books[1].title,
          bookPrice: books[1].price,
          bookQty: qty
        }
      ]


      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books)
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart)

      const result = await service.getCart(cartId);
      if( result ) { 
        const { cartDisplay } = result;
        expect( cartDisplay ).toEqual(expectedCartDisplay);
      }

    });

    it('should return cartSummary', async () => {
      const cartId = "valid_id"
      const bookIDs = ["1", "2"]
      const qty = 1
      const cart: Cart = {
        items: [
          {
            _id: bookIDs[0],
            qty: qty
          },
          {
            _id: bookIDs[1],
            qty: qty
          }
        ]
      };
      const books: any[] = [
        {
          _id: bookIDs[0],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
        {
          _id: bookIDs[1],
          title: "title",
          genre: ["some gen", "another gen"],
          price: 20,
          stock: 3
        },
      ]


      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books)
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart)

      const result = await service.getCart(cartId);
      if( result ) { 
        const {cartSummary} = result;
        expect(cartSummary.totalItems).toBe(2);
        expect(cartSummary.totalPrice).toBe(40); 
        expect(cartSummary.messages).toEqual([]);
      }

    });

    it('should handle repo error in get', () => {
      const validId = "validId"
      mockCartRepo.getCart = jest.fn().mockRejectedValue(new Error('Redis error'));
      expect(service.getCart(validId)).rejects.toThrow('Redis error');
      expect(mockCartRepo.getCart).toHaveBeenCalledWith(validId);
    });

    it('should handle service error in fetch books ', async () => {
      const cartId = "valid_id"
      const bookIDs = ["1", "2"]
      const qty = 1
      const cart: Cart = {
        items: [
          { _id: bookIDs[0], qty: qty },
          { _id: bookIDs[1], qty: qty }
        ]
      };

      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockRejectedValue(new Error('Service error'));
      await expect(service.getCart(cartId)).rejects.toThrow('Service error');
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledWith(bookIDs);
    });
    
  })


  // it('should test private method', () => {
  //   const privateCartItem = (service as any)['calculateCartMeta'].bind(service);
  //   // https://chatgpt.com/c/693a76e5-a39c-8322-aff4-58461a883fc3
  //   // try to test this later on how to test private method properly
  // });



  describe('generate checkout render data', () => {
    // should fetch cart using cartId 
    // should handle redis error
    // should generate proper checkout render data 
    // should validate shipping address 

    it('should fetch cart using cartId', async () => {
      const cartId = "cartId";
      const cart: Cart = {
        items: [
          { _id: "book1", qty: 2 }
        ]
      }

      const books: any[] = [
        {
          _id: "book1",
          title: "Book One",
          genre: ["Fiction"],
          price: 10,
          stock: 10
        },
      ];
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books);
      await service.generateCheckoutRenderData(cartId);
      expect( mockCartRepo.getCart ).toHaveBeenCalledWith( cartId );
      expect( mockCartRepo.getCart ).toHaveBeenCalledTimes(1);
    });


    it('should handle redis error when fetching cart', async () => {
      const cartId = "cartId";
      mockCartRepo.getCart = jest.fn().mockRejectedValue( new Error("Redis error") );
      await expect( service.generateCheckoutRenderData(cartId) ).rejects.toThrow("Redis error");
      expect( mockCartRepo.getCart ).toHaveBeenCalledWith( cartId );
      expect( mockCartRepo.getCart ).toHaveBeenCalledTimes(1);
    });


    it('should return fetch books using item ids in the cart', async () => {
      const cartId = "cartId";
      const itemIds = ["book1", "book2"];
      const cart: Cart = {
        items: [
          { _id: itemIds[0], qty: 2 },
          { _id: itemIds[1], qty: 4 },
        ]
      }
      const books: any[] = [
        {
          _id: itemIds[0],
          title: "Book One",
          genre: ["Fiction"],
          price: 10,
          stock: 10
        },
        {
          _id: itemIds[1],
          title: "Book Two",
          genre: ["Non-Fiction"],
          price: 15,
          stock: 5
        },
      ];
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books);
      await service.generateCheckoutRenderData(cartId);
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledWith(itemIds)
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledTimes(1)
    });
    

    it('should handle service error when fetching books', async () => {
      const cartId = "cartId";
      const itemIds = ["book1", "book2"];
      const cart: Cart = {
        items: [
          { _id: itemIds[0], qty: 2 },
          { _id: itemIds[1], qty: 4 },
        ]
      }
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockRejectedValue( new Error("Service error") );
      await expect( service.generateCheckoutRenderData(cartId) ).rejects.toThrow("Service error");
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledWith(itemIds)
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledTimes(1)
    });

    it('should return correct checkout meta data', async () => {
      const cartId = "cartId";
      const itemIds = ["book1", "book2"];
      const cart: Cart = {
        items: [
          {_id: itemIds[0], qty: 4},
          {_id: itemIds[1], qty: 3}
        ]
      }

      const books: any[] = [
        {
          _id: itemIds[0],
          title: "Book One",
          genre: ["Fiction"],
          price: 10,
          stock: 10
        },
        {
          _id: itemIds[1],
          title: "Book Two",
          genre: ["Non-Fiction"],
          price: 15,
          stock: 5
        },
      ];

      const expectedCheckout: CheckoutSummary = {
        totalItems: 7,
        totalPrice: 85,
        shippingCost: SHIPPING_COST,
        grandTotal: 185
      }

      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books);
      const result = await service.generateCheckoutRenderData(cartId);


      expect(mockCartRepo.getCart).toHaveBeenCalledWith(cartId)
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledWith(itemIds)

      expect(mockCartRepo.getCart).toHaveBeenCalledTimes(1)
      expect(mockBooksService.getBooksByIds).toHaveBeenCalledTimes(1)

      expect(result).toEqual(expectedCheckout);
    })


  })


  describe('getCartForOrder', () => {
    // should fetch cart using cartId
    // should handle redis error
    // should return null if no cart found
    // should return cart data if cart found
    
    it('should fetch cart using cartId', async () => {
      const cartId = "cartId";
      mockCartRepo.getCart = jest.fn().mockResolvedValue(null);
      await service.getCartForOrder(cartId);
      expect( mockCartRepo.getCart ).toHaveBeenCalledWith( cartId );
      expect( mockCartRepo.getCart ).toHaveBeenCalledTimes(1);
    });

    it('should handle redis error when fetching cart', async () => {
      const cartId = "cartId";
      mockCartRepo.getCart = jest.fn().mockRejectedValue( new Error("Redis error") );
      await expect( service.getCartForOrder(cartId) ).rejects.toThrow("Redis error");
      expect( mockCartRepo.getCart ).toHaveBeenCalledWith( cartId );
      expect( mockCartRepo.getCart ).toHaveBeenCalledTimes(1);
    });
    
    it('should return null if no cart found', async () => {
      const cartId = "cartId";
      mockCartRepo.getCart = jest.fn().mockResolvedValue(null);
      const result = await service.getCartForOrder(cartId);
      expect(result).toBeNull();
    });

    it('should return cart data if cart found', async () => {
      const cartId = "cartId";
      const cart: Cart = {
        items: [
          { _id: "book1", qty: 2 }
        ]
      }
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart);
      const result = await service.getCartForOrder(cartId);
      expect(result).toEqual(cart);
    });


  })
});
