import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { mock } from 'node:test';


describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockService: Partial<PaymentsService>;

  beforeEach(async () => {

    mockService = {
      createPaymentSession: jest.fn(),
      processPayment: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService
        }
      ]
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('createSession', () => { 
    // should use amount / currency / orderId to create session
    // should return sessionId
    // should handle errors from service

    it('should use correct parameter to create session', async () => {
      mockService.createPaymentSession = jest.fn().mockResolvedValue('session_12345');
      const dto = {
        amount: 1000,
        currency: 'USD',
        orderId: 'order_12345'
      };

      await controller.createSession(dto as any);
      expect(mockService.createPaymentSession).toHaveBeenCalledWith(1000, 'USD', 'order_12345');
    });


    it('should use correct parameter to create session', async () => {
      mockService.createPaymentSession = jest.fn().mockResolvedValue('session_12345');
      const dto = {
        amount: 1000,
        currency: 'USD',
        orderId: 'order_12345'
      };

      const actual = await controller.createSession(dto as any);
      expect(actual).toEqual({ sessionId: 'session_12345' });
    });


    it('should handle errors from service', async () => {
      mockService.createPaymentSession = jest.fn().mockRejectedValue(new Error('Service error'));
      const dto = {
        amount: 1000,
        currency: 'USD',
        orderId: 'order_12345'
      };

      await expect(controller.createSession(dto as any)).rejects.toThrow('Service error');
    });
  });


  describe('process payment', () => { 
    // should use sessionId / success to process payment
    // should return payment intent response
    // should handle errors from service



    it('should use sessionId / success to process payment', async () => {
      const dto = {
        sessionId: 'session_12345',
        success: true
      }

      const successMockResponse = {
        sessionId: 'cs_test_unknown',
        success: true,
        message: 'Payment successful',
        url: 'https://checkout.stripe.com/pay/cs_test_unknown'
      }

      mockService.processPayment = jest.fn().mockResolvedValue(successMockResponse);

      const actual = await controller.processPayment(dto as any);
      expect(mockService.processPayment).toHaveBeenCalledWith('session_12345', true);
      expect(mockService.processPayment).toHaveBeenCalledTimes(1);
      expect(actual).toEqual(successMockResponse);


    });



    it('should use sessionId / failed to process payment', async () => {
      const dto = {
        sessionId: 'session_12345',
        success: false
      }

      const failMockResponse = {
        sessionId: 'cs_test_unknown',
        success: false,
        message: 'Payment failed',
        url: 'https://checkout.stripe.com/pay/cs_test_unknown'
      }

      mockService.processPayment = jest.fn().mockResolvedValue(failMockResponse);

      const actual = await controller.processPayment(dto as any);
      expect(mockService.processPayment).toHaveBeenCalledWith('session_12345', false);
      expect(mockService.processPayment).toHaveBeenCalledTimes(1);
      expect(actual).toEqual(failMockResponse);

    });



    it('should handle erros from service', async () => { 
      const dto = {
        sessionId: 'session_12345',
        success: true
      }
      mockService.processPayment = jest.fn().mockRejectedValue(new Error('Service error'));
      await expect(controller.processPayment(dto as any)).rejects.toThrow('Service error');
    });

  });
});
