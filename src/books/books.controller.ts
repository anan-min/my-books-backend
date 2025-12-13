import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common'
import { BooksService } from './books.service';
import { plainToInstance } from 'class-transformer';
import { BookOutputDto } from './dtos/book-output.dto'

@Controller('books')
export class BooksController {
    constructor (private readonly bookService: BooksService) {}
    @Get() 
    async getDefaultBooks(): Promise<BookOutputDto[]> {
        const books = await this.bookService.getDefaultBooks();
        // return books.map((book: any) =>
        //     plainToInstance(BookOutputDto, { ...book, _id: book._id.toString() }, { excludeExtraneousValues: true })
        // );

        return books.map((book: any) =>
            plainToInstance(BookOutputDto, book, { excludeExtraneousValues: true })
        );
    }
}
