import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentGateway { 
    constructor(private readonly httpService: HttpService) {}

    public async createPaymentSession(amount: number, currency: string, orderId: string): Promise<string> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('https://localhost:6969/payments/pay', {
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


    public async paymentSuccess(sessionId: string, success: boolean): Promise<boolean> {
        // simulate payment success 
        return true
    }

    public async paymentFailed(sessionId: string, success: boolean): Promise<boolean> {
        // simulate payment failed 
        return false
    }


}