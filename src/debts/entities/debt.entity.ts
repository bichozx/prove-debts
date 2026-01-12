import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
    length: 255,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: DebtStatus.PENDING,
  })
  status: DebtStatus;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt?: Date;
}
