import { Injectable } from '@nestjs/common';
import { BookRepository } from './books.repository';
import { BookDocument } from './schemas/Book.schema';

@Injectable()
export class BooksService {
    constructor(private readonly bookRepository: BookRepository) {}
 
    async getDefaultBooks(): Promise<BookDocument[] | []> {
        return (await this.bookRepository.findDefaultBooks());
    }
    
    async hasEnoughStock(id: string, quantity: number): Promise<boolean> {
        const stock = await this.bookRepository.getBookStock(id);
        if(stock === null) {
            return false;
        }
        return stock >= quantity;
    }
    
    async getBooksByIds(ids: string[]): Promise<BookDocument[]> {
        try {
            return this.bookRepository.getBooksByIds(ids);
        } catch (error) {
            throw (error);
        }

    }
}
