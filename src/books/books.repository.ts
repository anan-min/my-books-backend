import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './Book.schema';
import { Model } from 'mongoose';
import { BookData } from './Book.schema';


@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) {}

;
    async createBook (title: string, genre: string[], price: number, stock: number): Promise<BookData> {
        const result =  await this.bookModel.create({title, genre, price, stock})
        return result.toObject()
    }

    async findAllBooks(): Promise<BookData[]> {
        // Use lean and exec for queries
        return this.bookModel.find().lean().exec();
    }

    async findBookById(id: string): Promise<BookData | null> {
        return this.bookModel.findById(id).lean().exec();
    }

}
