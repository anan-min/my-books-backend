import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentGateway } from './payment-gateway';

@Module({
  imports: [HttpModule],
  providers: [PaymentGateway],
  exports: [PaymentGateway], 
})
export class PaymentGatewayModule {}