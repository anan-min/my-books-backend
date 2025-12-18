import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { CartsService } from '../carts/carts.service';
import { BooksService } from '../books/books.service';
import { PaymentsService } from '../payments/payments.service';

describe('OrdersService', () => {
  let service: OrdersService;

  let mockBookservice: Partial<BooksService>;
  let mockCartService: Partial<CartsService>;
  let mockOrderRepo: Partial<OrdersRepository>;
  let mockPaymentsService: Partial<PaymentsService>;


  beforeEach(async () => {
    mockBookservice = {
      getBooksByIds: jest.fn()
    }
    mockCartService = {
      getCartForOrder: jest.fn()
    }
    mockOrderRepo = {
      createOrder: jest.fn()
    }
    mockPaymentsService = {
      createPaymentSession: jest.fn()
    }



    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: mockOrderRepo
        },
        {
          provide: CartsService,
          useValue: mockCartService
        },
        {
          provide: BooksService,
          useValue: mockBookservice
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService
        }
        
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });


  describe('create order service', () => {
    const mockCart = {
      items: [
        {
          _id: "1",
          qty: 1
        },
        {
          _id: "2",
          qty: 2
        }
      ]
    }

    const mockBooks = [
      {
        _id: `1`,
        title: `Book Title 1`,
        genre: ['Fiction', 'Adventure'],
        price: 10,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: `2`,
        title: `Book Title 2`,
        genre: ['Fiction', 'Adventure'],
        price: 11,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ]

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  
  
    // should fetch cart from redis 
    it('should fetch cart from redis', async () => {
      mockCartService.getCartForOrder = jest.fn().mockResolvedValue(mockCart);
      mockBookservice.getBooksByIds = jest.fn().mockResolvedValue(null);
      mockPaymentsService.createPaymentSession = jest.fn().mockResolvedValue("someSessionId");
      mockOrderRepo.createOrder = jest.fn().mockResolvedValue(null);

      const cartId = "validCartId";
      await service.createOrder(cartId, "someShippingAddress");
      expect( mockCartService.getCartForOrder ).toHaveBeenCalledWith(cartId);
      expect( mockCartService.getCartForOrder ).toHaveBeenCalledTimes(1);
    });

    // should fetch book from items in cart 
    // -- not this scenario
    // should return ? if cart is empty 
    // should return ? if book is empty fetch by cart
  
  
    it('should fetch book from database with item in cart ', async () => {
      mockCartService.getCartForOrder = jest.fn().mockResolvedValue(mockCart);
      mockBookservice.getBooksByIds = jest.fn().mockResolvedValue(mockBooks);
      mockPaymentsService.createPaymentSession = jest.fn().mockResolvedValue("someSessionId");
      const itemIds = mockCart.items.map( (item) => item._id );
      mockOrderRepo.createOrder = jest.fn().mockResolvedValue(null);

      const cartId = "validCartId";
      await service.createOrder(cartId, "someShippingAddress");
      expect( mockBookservice.getBooksByIds ).toHaveBeenCalledWith(itemIds);
      expect( mockBookservice.getBooksByIds ).toHaveBeenCalledTimes(1);
    });


    it('should use correct parameter to create session', async () => {
      mockCartService.getCartForOrder = jest.fn().mockResolvedValue(mockCart);
      mockBookservice.getBooksByIds = jest.fn().mockResolvedValue(mockBooks);
      mockPaymentsService.createPaymentSession = jest.fn().mockResolvedValue("someSessionId");
      const itemIds = mockCart.items.map( (item) => item._id );
      mockOrderRepo.createOrder = jest.fn().mockResolvedValue(null);

      const cartId = "validCartId";
      await service.createOrder(cartId, "someShippingAddress");
      expect( mockPaymentsService.createPaymentSession ).toHaveBeenCalledWith(132, 'USD', cartId);
      expect( mockPaymentsService.createPaymentSession ).toHaveBeenCalledTimes(1);
    });
  
    it('should create order with correct parameter',  async () => {
      mockCartService.getCartForOrder = jest.fn().mockResolvedValue(mockCart);
      mockBookservice.getBooksByIds = jest.fn().mockResolvedValue(mockBooks);
      mockPaymentsService.createPaymentSession = jest.fn().mockResolvedValue("someSessionId");
      const itemIds = mockCart.items.map( (item) => item._id );
      mockOrderRepo.createOrder = jest.fn().mockResolvedValue(null);

      const expectedInput = {
        items: [
          {
            _id: "1",
            title: "Book Title 1",
            price: 10,
            qty: 1,
          },
          {
            _id: "2",
            title: "Book Title 2",
            price: 11,
            qty: 2,
          }
        ],
        totalPrice: 132,
        shippingAddress: "someShippingAddress",
        paymentSessionId: "someSessionId",
        status: "PENDING"
      }

      const cartId = "validCartId";
      const shippingAddress = "someShippingAddress";
      await service.createOrder(cartId, shippingAddress);

      expect( mockOrderRepo.createOrder ).toHaveBeenCalledWith( expectedInput );
      expect( mockOrderRepo.createOrder ).toHaveBeenCalledTimes(1);

    });
  })
});
