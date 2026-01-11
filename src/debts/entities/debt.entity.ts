import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DebtStatus } from '../enums/debt-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    enum: DebtStatus,
    default: DebtStatus.PENDING,
  })
  status: DebtStatus;

  @ManyToOne(() => User, { eager: false })
  User: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt?: Date;
}
