import { IsNumber, IsPositive, IsString, IsOptional } from "class-validator";



export class AddItemRequestDto {
  @IsString()
  bookId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
  
  @IsOptional()
  cartId?: string | null;
}
