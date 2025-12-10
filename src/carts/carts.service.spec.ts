import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { BooksService } from '../books/books.service';
import { Cart, CartsRepository } from './carts.repository';
import { BookData } from '../books/Book.schema'
import { mock } from 'node:test';
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
      const books: BookData[] = [

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
      const books: BookData[] = [
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
      const books: BookData[] = [
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

      const books: BookData[] = [
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


    it('should return meta data without update if cart is valid', async () => {
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
      const books: BookData[] = [
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
        const {cartId, cart, meta} = result;

        expect(cartId).toBe(cartId);
        expect(cart).toEqual(cart);

        expect(meta.total_items).toBe(2);
        expect(meta.total_price).toBe(40); 
        expect(meta.shipping_cost).toBe(100);
        expect(meta.grand_total).toBe(140);
        expect(meta.messages).toEqual([]);
      }

    });


    it('should return valid meta data if cart is empty', async () => {
      const cartId = "valid_id"
      const cart: Cart = { items:[] };
      const books: BookData[] = []


      mockBooksService.getBooksByIds = jest.fn().mockResolvedValue(books)
      mockCartRepo.getCart = jest.fn().mockResolvedValue(cart)

      const result = await service.getCart(cartId);
      if( result ) { 
        const {cartId, cart, meta} = result;

        expect(cartId).toBe(cartId);
        expect(cart).toEqual(cart);

        expect(meta.total_items).toBe(0);
        expect(meta.total_price).toBe(0); 
        expect(meta.shipping_cost).toBe(0);
        expect(meta.grand_total).toBe(0);
        expect(meta.messages).toEqual([]);
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
});
