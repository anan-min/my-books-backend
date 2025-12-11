import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common'
import { BooksService } from './books.service';
import { plainToInstance } from 'class-transformer';
import { BookOutputDto } from './books.dto';
import { BookData } from './Book.schema';

@Controller('books')
export class BooksController {
    constructor (private readonly bookService: BooksService) {}
    
    @Get() 
    async getDefaultBooks() {
        const books: BookData[] = await this.bookService.getDefaultBooks();
        return books.map((book: BookData) => plainToInstance(BookOutputDto, book, { excludeExtraneousValues: true }));
    }

}
