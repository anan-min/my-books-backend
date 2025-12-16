import { CreateSessionRequestDto } from './dtos/create-session.dto';
import { PaymentProcessRequestDto } from './dtos/payment-process.dto';
import { PaymentsService } from './payments.service';
import { Controller } from '@nestjs/common';
import { Body, Post} from '@nestjs/common'
import { CreateSessionResponse, PaymentIntentResponse } from './interfaces/payments.interface';



@Controller('payments')
export class PaymentsController {

    constructor(private paymentsService: PaymentsService){}

    @Post('session')
    async createSession(
        @Body() body: CreateSessionRequestDto
    ): Promise<CreateSessionResponse> {
        return { sessionId: await this.paymentsService.createPaymentSession(body.amount, body.currency, body.orderId) };
    }

    @Post('process')
    async processPayment(
        @Body() body: PaymentProcessRequestDto
    ): Promise<PaymentIntentResponse> {
        return await this.paymentsService.processPayment(body.sessionId, body.success);
    }

}
