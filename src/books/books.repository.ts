import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './Book.schema';
import { Model } from 'mongoose';
import { BookData } from './Book.schema';


@Injectable()
export class BookRepository {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) {}


    private bookToBookData(book: any): BookData {
        return {
            _id: book._id.toString(),
            title: book.title,
            genre: book.genre,
            price: book.price,
            stock: book.stock,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
        };
    }

    async findDefaultBooks(): Promise<BookData[]> {
        const books = await this.bookModel.find()
            .limit(20)
            .lean()
            .exec();
        
        // return at most 20 books with correct structure
        return books.map(book => this.bookToBookData(book)).slice(0, 20);
    }


    async getBookStock(id: string): Promise<number | null> {
        const book = await this.bookModel.findById(id).lean().exec();
        if (!book) {
            return null;
        }
        return book.stock;
    }

    async getBooksByIds(ids: string[]): Promise<BookData[]> {
        if(ids.length === 0){
            return [] 
        }

        try {
            const books = await this.bookModel.find({
                _id: { $in: ids }
            }).lean().exec();
            return books.map(book => this.bookToBookData(book._id));
        } catch (error) {
            throw error;
        }


    }


    





}
