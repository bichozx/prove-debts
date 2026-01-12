import {
  BadRequestException,
  //BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Debt } from './entities/debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

import { DebtStatus } from './enums/debt-status.enum';

import { REDIS_CLIENT } from '../redis/redis.module';
import Redis from 'ioredis';

import { DebtSummaryDto } from './dto/DebtSummaryDto';
import { DebtSummaryRaw } from '../common/DebtSummary.interface';

@Injectable()
export class DebtsService {
  private readonly CACHE_TTL = 300;
  constructor(
    @InjectRepository(Debt)
    private debtsRepository: Repository<Debt>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {
    console.log('🏗️ DebtsService initialized');
    console.log('🔌 Redis client injected:', this.redis ? 'YES ✅' : 'NO ❌');
  }

  private cacheKey(userId: string) {
    return `debts_user_${userId}`;
  }

  private async invalidateUserCache(userId: string) {
    await this.redis.del(this.cacheKey(userId));
  }

  // ───────────────────────────────────────────────

  async createDebt(dto: CreateDebtDto, userId: string): Promise<Debt> {
    const debt = this.debtsRepository.create({
      amount: dto.amount,
      description: dto.description,
      status: DebtStatus.PENDING,
      user: { id: userId },
    });

    const saved = await this.debtsRepository.save(debt);
    await this.invalidateUserCache(userId);

    return saved;
  }

  // ───────────────────────────────────────────────
  async updateDebt(
    id: string,
    dto: UpdateDebtDto,
    userId: string,
  ): Promise<Debt> {
    const debt = await this.debtsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!debt) throw new NotFoundException('Debt not found');
    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Paid debt cannot be modified');
    }

    Object.assign(debt, dto);
    const updated = await this.debtsRepository.save(debt);
    await this.invalidateUserCache(userId);

    return updated;
  }

  // ───────────────────────────────────────────────

  async markAsPaid(id: string, userId: string): Promise<Debt> {
    const debt = await this.debtsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!debt) throw new NotFoundException('Debt not found');
    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Already paid');
    }

    debt.status = DebtStatus.PAID;
    debt.paidAt = new Date();

    const paid = await this.debtsRepository.save(debt);
    await this.invalidateUserCache(userId);

    return paid;
  }

  // ───────────────────────────────────────────────
  async deleteDebt(id: string, userId: string): Promise<void> {
    const debt = await this.debtsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!debt) throw new NotFoundException('Debt not found');

    await this.debtsRepository.remove(debt);
    await this.invalidateUserCache(userId);
  }

  // ───────────────────────────────────────────────
  async findAllByUserCached(userId: string): Promise<Debt[]> {
    const cacheKey = `debts_user_${userId}`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Cache Key:', cacheKey);

    try {
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        console.log('🔥 FROM CACHE');
        console.log('🔥 FROM CACHE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(cached);
        //return cached;
      }
    } catch (error) {
      console.error('❌ Error getting from cache:', error);
    }

    console.log('🔍 Querying database...');
    const debts = await this.debtsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    console.log('📊 Found', debts.length, 'debts in DB');
    console.log('🟢 FROM DB - SAVING CACHE');

    try {
      // Guardar en Redis con TTL
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(debts));
      console.log('✅ Saved to Redis');
    } catch (error) {
      console.error('❌ Error saving to cache:', error);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return debts;
  }

  // ───────────────────────────────────────────────
  async exportDebts(
    userId: string,
    format: 'json' | 'csv' = 'json',
  ): Promise<{ filename: string; content: string }> {
    const debts = await this.debtsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (format === 'json') {
      return {
        filename: `debts-${userId}.json`,
        content: JSON.stringify(debts, null, 2),
      };
    }

    // CSV
    const headers = [
      'id',
      'amount',
      'description',
      'status',
      'createdAt',
      'paidAt',
    ];

    const rows = debts.map((d) =>
      [
        d.id,
        d.amount,
        `"${d.description ?? ''}"`,
        d.status,
        d.createdAt?.toISOString(),
        d.paidAt?.toISOString() ?? '',
      ].join(','),
    );

    const csv = [headers.join(','), ...rows].join('\n');

    return {
      filename: `debts-${userId}.csv`,
      content: csv,
    };
  }

  async getDebtSummary(userId: string): Promise<DebtSummaryDto> {
    const raw = await this.debtsRepository
      .createQueryBuilder('debt')
      .select('COUNT(*)', 'totalDebts')
      .addSelect('COALESCE(SUM(debt.amount), 0)', 'totalAmount')
      .addSelect(
        `COALESCE(SUM(CASE WHEN debt.status = :paid THEN debt.amount ELSE 0 END), 0)`,
        'paidAmount',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN debt.status = :pending THEN debt.amount ELSE 0 END), 0)`,
        'pendingAmount',
      )
      .addSelect(
        `SUM(CASE WHEN debt.status = :paid THEN 1 ELSE 0 END)`,
        'countPaid',
      )
      .addSelect(
        `SUM(CASE WHEN debt.status = :pending THEN 1 ELSE 0 END)`,
        'countPending',
      )
      .where('debt.userId = :userId', { userId })
      .setParameters({
        paid: DebtStatus.PAID,
        pending: DebtStatus.PENDING,
      })
      .getRawOne<DebtSummaryRaw>();

    if (!raw) {
      return {
        totalDebts: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        countPaid: 0,
        countPending: 0,
      };
    }

    return {
      totalDebts: Number(raw.totalDebts),
      totalAmount: Number(raw.totalAmount),
      paidAmount: Number(raw.paidAmount),
      pendingAmount: Number(raw.pendingAmount),
      countPaid: Number(raw.countPaid),
      countPending: Number(raw.countPending),
    };
  }
}
