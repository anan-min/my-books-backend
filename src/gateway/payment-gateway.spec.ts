import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGateway } from './payment-gateway';
import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';

describe('PaymentGateway', () => {
    let service: PaymentGateway;
    let mockHttpService: Partial<HttpService>;

    
    beforeEach(async () => {
        mockHttpService = { 
            post: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentGateway,
                { provide: HttpService, useValue: mockHttpService }
            ],
        }).compile();

        service = module.get<PaymentGateway>(PaymentGateway);
    })

    describe('create payment session', () => {
        // it should return session_id 
        it('should return session_id', async () => {
            mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: { sessionId: 'test_session_id' }}));
            const result = service.createPaymentSession(1000, 'USD', 'order123');
            expect(result).resolves.toEqual('test_session_id');
        });
        // it should call httpService.post with correct parameters
        it('should call httpservice.post with correct parameters', async () => {
            mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: { sessionId: 'test_session_id' }}));
            await service.createPaymentSession(1000, 'USD', 'order123');
            const request = {amount: 1000, currency: 'USD', orderId: 'order123'}

            expect(mockHttpService.post).toHaveBeenCalledWith('https://localhost:6969/payments/pay', request);
            expect(mockHttpService.post).toHaveBeenCalledTimes(1);
        });
        // it should handle errors from httpService.post
        it('should handle errors from httpservice.post', () => {
            mockHttpService.post = jest.fn().mockReturnValueOnce({ toPromise: () => { throw new Error("HTTP Error") } });
            const result = service.createPaymentSession(1000, 'USD', 'order123');
            expect(result).rejects.toThrow(InternalServerErrorException);
        });
    })

    describe('payment success', () => {
        // it should return true when payment is successful
        // it should call httpService.post with correct parameters
        // it should handle errors from httpService.post

    })


    describe('payment failed', () => {
        // it should return false when payment fails
        // it should call httpService.post with correct parameters
        // it should handle errors from httpService.post
    })
})