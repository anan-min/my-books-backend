import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose";

@Schema()
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  genre: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

}


export interface BookData {
  _id: Types.ObjectId;
  title: string;
  genre: string[];
  price: number;
  stock: number;
  
  // check if timestamp exists manually 
  createdAt?: Date;
  updatedAt?: Date;
}


export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.set('timestamps', true);