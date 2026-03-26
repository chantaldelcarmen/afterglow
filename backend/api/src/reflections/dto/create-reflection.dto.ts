import { IsNotEmpty, IsString } from "class-validator";

export class CreateReflectionDto {
    @IsString()
    @IsNotEmpty()
    reflection_text: string;
}