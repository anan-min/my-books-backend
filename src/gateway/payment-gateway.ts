import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentGateway { 
    constructor(private readonly httpService: HttpService) {}

    async createPaymentSession(amount: number, currency: string, orderId: string): Promise<string> {
        // test payment session using mount bank 
        // response with sessionId 
        // need amount / currency / orderId 
        return ''
    }


    async paymentSuccess(sessionId: string, success: boolean): Promise<boolean> {
        // simulate payment success 
        return true
    }

    async paymentFailed(sessionId: string, success: boolean): Promise<boolean> {
        // simulate payment failed 
        return false
    }


}