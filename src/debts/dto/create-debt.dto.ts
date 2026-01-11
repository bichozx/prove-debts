import { IsNotEmpty, IsPositive, MaxLength } from 'class-validator';

export class CreateDebtDto {
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
