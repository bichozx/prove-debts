import { IsNotEmpty, IsPositive, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateDebtDto {
  @ApiProperty({ example: 100.5 })
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Cena' })
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
