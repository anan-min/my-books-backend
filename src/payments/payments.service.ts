import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../gateway/payment-gateway';
import { ProcessPaymentData } from 'src/gateway/payment-gateway.interface';

@Injectable()
export class PaymentsService {
    constructor(private readonly paymentGateway: PaymentGateway) {}

    async processPayment(sessionId: string, success: boolean): Promise<ProcessPaymentData> {
        return this.paymentGateway.processPayments(sessionId, success);
    }

    async createPaymentSession(amount: number, currency: string, cartId: string): Promise<string> {
        return this.paymentGateway.createPaymentSession(amount, currency, cartId);
    }
}
