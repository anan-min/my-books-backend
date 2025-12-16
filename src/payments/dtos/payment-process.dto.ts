import { IsBoolean, IsNotEmpty, IsString } from "class-validator";


export class PaymentProcessRequestDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsBoolean()
    success: boolean;
}