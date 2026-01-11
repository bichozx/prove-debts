import { CreateDebtDto } from './create-debt.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {}
