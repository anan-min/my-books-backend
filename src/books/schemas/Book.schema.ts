import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, HydratedDocument } from "mongoose";

export type BookDocument = HydratedDocument<Book>;

@Schema({timestamps: true})
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  genre: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  // @Prop()
  // createdAt: Date;

  // @Prop()
  // updatedAt: Date;
}


export const BookSchema = SchemaFactory.createForClass(Book);