import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
describe('OrdersController', () => {
  let controller: OrdersController;
  let mockService: Partial<OrdersService>;

  beforeEach(async () => {
    mockService = {
      createOrder: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockService
        }
      ]
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  // should return invalid request cartId is null 
  // should return invalid request when shipping address is missing
  // should create order successfully

  it('should return invalid request when cartId is null', async () => {

    const invalidCartId = "";
    const validAddress = "123 Main St, Springfield, USA";
    mockService.createOrder = jest.fn().mockImplementation(() => {
      throw new BadRequestException('Invalid cartId');
    });

    await expect(controller.createOrder({cartId: invalidCartId, shippingAddress: validAddress})).rejects.toThrow(BadRequestException);

    
  });

  it('should return invalid request when shipping address is missing', async () => {
    const validCartId = "validCartId123";
    const invalidAddress = "";

    mockService.createOrder = jest.fn().mockImplementation(() => {
      throw new BadRequestException('Invalid shipping address');
    });
    await expect(controller.createOrder({cartId: validCartId, shippingAddress: invalidAddress})).rejects.toThrow(BadRequestException);
  });

  it('should create order successfully', async () => {
    const validCartId = "validCartId123";
    const validAddress = "123 Main St, Springfield, USA";

    const mockOrder = {
      _id: new Types.ObjectId(),
      items: [
        { _id: 'book1', title: 'Book One', price: 10, qty: 2 },
        { _id: 'book2', title: 'Book Two', price: 15, qty: 1 },
      ],
      totalPrice: 135,
      shippingAddress: validAddress,
      status: 'pending',
      paymentSessionId: '',
    };


    const expectedResponse ={
      orderId: expect.any(String),
      items: mockOrder.items,
      totalPrice: mockOrder.totalPrice,
      shippingAddress: mockOrder.shippingAddress,
      status: mockOrder.status,
      paymentSessionId: mockOrder.paymentSessionId,
    }


   
    mockService.createOrder = jest.fn().mockResolvedValue(mockOrder);
    const actual = await controller.createOrder({cartId: validCartId, shippingAddress: validAddress});
    expect(actual).toEqual(expectedResponse);
  });
});
