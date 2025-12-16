
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsDate, Min, IsArray, IsNumber } from 'class-validator';
import { Types } from 'mongoose';


export class BookOutputDto {
    @Expose()
    _id: Types.ObjectId;

    @Expose()
    @IsString()
    title: string; 

    @Expose()
    @IsNumber()
    @Min(0)
    price: number; 

    @Expose()
    @IsNumber()
    @Min(0)
    stock: number; 

    @Expose()
    @IsArray()
    @IsString({ each: true })
    genre: string[];

    @Exclude()
    @IsDate()
    createdAt: Date; 

    @Exclude()
    @IsDate()
    updatedAt: Date; 
}