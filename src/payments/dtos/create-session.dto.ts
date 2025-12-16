import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";


export class CreateSessionRequestDto {
    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    currency: string;

    @IsString()
    @IsNotEmpty()
    orderId: string;
}