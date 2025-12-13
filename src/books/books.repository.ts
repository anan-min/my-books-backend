import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/Book.schema';
import { Model } from 'mongoose';
import {  BookDocument } from './schemas/Book.schema';


@Injectable()
export class BookRepository {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
    ) {}

    async findDefaultBooks(): Promise<BookDocument[]> {
        return await this.bookModel.find()
            .exec();
    }


    async getBookStock(id: string): Promise<number | null> {
        const book = await this.bookModel.findById(id).exec();
        if (!book) {
            return null;
        }
        return book.stock;
    }

    async getBooksByIds(ids: string[]): Promise<BookDocument[]> {
        if(ids.length === 0){
            return [] 
        }

        try {
            return await this.bookModel.find({
                _id: { $in: ids }
            }).exec();
            
        } catch (error) {
            throw error;
        }

    }

    
    // private bookToBookData(book: BookDocument): BookData {
    //     return {
    //         _id: book._id.toString(),
    //         title: book.title,
    //         genre: book.genre,
    //         price: book.price,
    //         stock: book.stock,
    //         createdAt: book.createdAt,
    //         updatedAt: book.updatedAt,
    //     };
    // }
}
