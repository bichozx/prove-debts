import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Debt } from './entities/debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { User } from '../users/entities/user.entity';
import { DebtStatus } from './enums/debt-status.enum';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtsRepository: Repository<Debt>,
  ) {}

  async createDebt(dto: CreateDebtDto, user: User): Promise<Debt> {
    const debt = this.debtsRepository.create({
      amount: dto.amount,
      status: DebtStatus.PENDING,
      user,
      description: dto.description, // 👈 si decides incluirla
    });

    return this.debtsRepository.save(debt);
  }

  async findAllByUser(userId: string): Promise<Debt[]> {
    return this.debtsRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateDebt(
    id: string,
    dto: UpdateDebtDto,
    userId: string,
  ): Promise<Debt> {
    const debt = await this.debtsRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!debt) throw new NotFoundException('Debt not found');

    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Paid debts cannot be modified');
    }

    Object.assign(debt, dto);
    return this.debtsRepository.save(debt);
  }

  async markAsPaid(id: string, userId: string): Promise<Debt> {
    const debt = await this.debtsRepository.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!debt) throw new NotFoundException('Debt not found');

    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Debt already paid');
    }

    debt.status = DebtStatus.PAID;
    debt.paidAt = new Date();

    return this.debtsRepository.save(debt);
  }
}
