import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { BooksService } from '../books/books.service';
import { Cart, CartsRepository } from './carts.repository';

describe('CartsService', () => {
  let service: CartsService;
  let mockCartRepo: Partial<CartsRepository>;
  let mockBooksService: Partial<BooksService>;



  beforeEach(async () => {
    mockCartRepo = {
      getCart: jest.fn(),
      createCart: jest.fn()
    }

    mockBooksService = {
      getDefaultBooks: jest.fn(),
      hasEnoughStock: jest.fn() 
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
    // scenario 1
    // no cart (no cartId)
    // always enough item in stock


    // test cases 
    // (1) normal flow 
    // should create a new cart and add the item, return the new cart id
    // should call enoughStock(1) getCart(1) createCart(1)
    // should call enoughStock getCart createCart with correct arguments


    // (2) error flow 
    // 2.1 should handle errors from repository when creating cart
    // 2.2 should handle erros from service when checking bookstock
    // 2.3 should handle errors from repository when get cart


    beforeEach( async () => {
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
      const {cartId, cart} = result!;

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
      expect(mockCartRepo.createCart).toHaveBeenCalledWith(expect.any(String), {_id: bookdId, qty: qty});
      expect(mockBooksService.hasEnoughStock).toHaveBeenCalledWith(bookdId, qty);
    });


    it('should handle errors from repository when creating cart', async () => {
      mockCartRepo.createCart = jest.fn().mockRejectedValue(new Error('Redis error'));

      await expect( service.addItem("bookId", 10, null) ).rejects.toThrow('Redis error');
      expect( mockCartRepo.createCart ).toHaveBeenCalled();
    });

     it('should handle errors from repository when get cart', async () => {
      mockCartRepo.getCart = jest.fn().mockRejectedValue(new Error('Redis error'));

      await expect( service.addItem("bookId", 10, null) ).rejects.toThrow('Redis error');
      expect( mockCartRepo.getCart ).toHaveBeenCalled();
    });

    it('should handle erros from service when checking bookstock', async () => {
      mockBooksService.hasEnoughStock = jest.fn().mockRejectedValue(new Error('Service error'));

      await expect( service.addItem("bookId", 10, null) ).rejects.toThrow('Service error');
      expect( mockBooksService.hasEnoughStock ).toHaveBeenCalled();
    });



    
  });
});
