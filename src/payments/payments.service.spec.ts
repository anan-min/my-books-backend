import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentGateway } from '../gateway/payment-gateway';
import { InternalServerErrorException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentGateway: Partial<PaymentGateway>;

  beforeEach(async () => {
    mockPaymentGateway = {
      processPayments: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [  PaymentsService, 
                    {
                      provide: PaymentGateway,
                      useValue: mockPaymentGateway
                    }
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('processPayment', () => {
    // should return processed payment data
    // should handle errors from payment gateway

    const data = {
                  sessionId: 'cs_test_unknown',
                  status: 'success',
                  message: 'Payment successful',
                  url: 'https://checkout.stripe.com/pay/cs_test_unknown'
                 };
    it('should return processed payment data', async () => {
      mockPaymentGateway.processPayments = jest.fn().mockResolvedValue(data);
      const actual = await service.processPayment("session_id1", true)
      expect(actual).toEqual(data);
    });


    it('should handle errors from payment gateway', async () => {
      mockPaymentGateway.processPayments = jest.fn().mockImplementation(() => {
        throw new InternalServerErrorException("Payment processing failed");
      });
      await expect(service.processPayment("session_id1", true)).rejects.toThrow(InternalServerErrorException);
    });
  });


  describe('createPaymentSession', () => {
    // should return session id from payment gateway
    // should handle errors from payment gateway

    it('should return session id from payment gateway', async () => {
      mockPaymentGateway.createPaymentSession = jest.fn().mockResolvedValue('test_session_id_123');
      const actual = await service.createPaymentSession(1000, 'USD', 'order123');
      expect(actual).toEqual('test_session_id_123');
    });

    it('should handle errors from payment gateway', async () => {
      mockPaymentGateway.createPaymentSession = jest.fn().mockImplementation(() => {
        throw new InternalServerErrorException("Failed to create payment session");
      });
      await expect(service.createPaymentSession(1000, 'USD', 'order123')).rejects.toThrow(InternalServerErrorException);
    });
  });

});

