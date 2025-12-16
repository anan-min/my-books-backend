import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common'
import { BooksService } from './books.service';
import { BookDocument } from './schemas/Book.schema';
import { BookResponse } from './interfaces/books.interface';

@Controller('books')
export class BooksController {
    constructor (private readonly bookService: BooksService) {}

    @Get() 
    async getDefaultBooks(): Promise<BookResponse[]> {
        const books = await this.bookService.getDefaultBooks();

        return books.map((book: any) => ({
            _id: book._id.toString(),
            title: book.title,
            price: book.price,
            stock: book.stock,
            genre: book.genre,
        }));
        
    }
}
