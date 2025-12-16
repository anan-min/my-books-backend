import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksService } from './books/books.service';
import { BooksModule } from './books/books.module';
import { CartsController } from './carts/carts.controller';
import { BooksController } from './books/books.controller';
import { CartsModule } from './carts/carts.module';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { OrdersController } from './orders/orders.controller';
import { PaymentsModule } from './payments/payments.module';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { PaymentGatewayModule } from './gateway/payment-gateway.module';
dotenv.config(); 


@Module({
  imports: [  
              BooksModule, 
              CartsModule, 
              OrdersModule, 
              RedisModule, 
              PaymentsModule,
              PaymentGatewayModule,
              MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost/nest')
            ],
  controllers: [AppController, CartsController, BooksController, OrdersController, PaymentsController],
  providers: [AppService, BooksService, OrdersService, OrdersService, PaymentsService],
})
export class AppModule {

}
