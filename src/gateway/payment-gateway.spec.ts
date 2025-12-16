import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGateway } from './payment-gateway';
import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';
import { mock } from 'node:test';

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

            expect(mockHttpService.post).toHaveBeenCalledWith('https://localhost:6969/payments/session', request);
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
        // it should call httpService.post with correct parameters
        it('should call httpservice.post with correct parameters', () => {
            // don't need to check response 
            // check if httpService.post is called with correct params
            // mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: { success: true }}));
            mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: { sessionId: 'test_session_id' }}));
            service.processPayments('test_session_id', true);
            const request = {sessionId: 'test_session_id', success: true}
            
            expect(mockHttpService.post).toHaveBeenCalledWith('https://localhost:6969/payments/pay', request);
            expect(mockHttpService.post).toHaveBeenCalledTimes(1);
        });

        // it should return true when payment is successful
        it('should return true when payment is successful', () => {
            // HTTP/1.1 200 OK
            // Content-Type: application/json
            // Connection: close
            // Date: Tue, 16 Dec 2025 07:31:30 GMT
            // Transfer-Encoding: chunked

            // {
            // "sessionId": "cs_test_unknown",
            // "status": "success",
            // "message": "Payment successful",
            // "url": "https://checkout.stripe.com/pay/cs_test_unknown"
            // }
            const data = {
                sessionId: 'cs_test_unknown',
                status: 'success',
                message: 'Payment successful',
                url: 'https://checkout.stripe.com/pay/cs_test_unknown'
            };
            mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: data }));
            const result = service.processPayments('cs_test_unknown', true);
            expect(result).resolves.toEqual(data);
        });


        it('should return false when payment is failed', () => {
            // HTTP/1.1 200 OK
            // Content-Type: application/json
            // Connection: close
            // Date: Tue, 16 Dec 2025 07:31:30 GMT
            // Transfer-Encoding: chunked

            // {
            // "sessionId": "cs_test_unknown",
            // "status": "success",
            // "message": "Payment successful",
            // "url": "https://checkout.stripe.com/pay/cs_test_unknown"
            // }
            const data = {
                sessionId: 'cs_test_unknown',
                status: 'fail',
                message: 'Payment successful',
                url: 'https://checkout.stripe.com/pay/cs_test_unknown'
            };
            mockHttpService.post = jest.fn().mockReturnValueOnce(of({ data: data }));
            const result = service.processPayments('cs_test_unknown', true);
            expect(result).resolves.toEqual(data);
        });

        // it should handle errors from httpService.post
        it('should handle errors from httpservice.post', () => {
            mockHttpService.post = jest.fn().mockReturnValueOnce({ toPromise: () => { throw new Error("HTTP Error") } });
            const result = service.processPayments('test_session_id', true);
            expect(result).rejects.toThrow(InternalServerErrorException);
        });

    })

})