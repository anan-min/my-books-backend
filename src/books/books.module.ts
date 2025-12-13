import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BookRepository } from './books.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schemas/Book.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Book', schema:  BookSchema }])],
  controllers: [BooksController],
  providers: [BooksService, BookRepository],
  exports: [BooksService, BookRepository],
})
export class BooksModule {

}
