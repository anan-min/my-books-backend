import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ProcessPaymentData } from './payment-gateway.interface';

@Injectable()
export class PaymentGateway { 
    constructor(private readonly httpService: HttpService) {}

    public async createPaymentSession(amount: number, currency: string, orderId: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:6969/payments/session', {
                    amount,
                    currency,
                    orderId
                })
            );

            if (!response || !response.data || !response.data.sessionId) {
                throw new InternalServerErrorException("Failed to create payment session");
            }

            return response.data.sessionId;
        } catch (error) {
            throw new InternalServerErrorException("Failed to create payment session");
        }
    }


    public async processPayments(sessionId: string, success: boolean): Promise<ProcessPaymentData> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:6969/payments/pay', {
                    sessionId,
                    success: success
                })
            );

            if (!response || !response.data || !response.data.sessionId) {
                throw new InternalServerErrorException("Failed to create payment session");
            }

            return response.data;
        } catch (error) {
            throw new InternalServerErrorException("Failed to create payment session");
        }
    }




}