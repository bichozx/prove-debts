// import { Module } from '@nestjs/common';
// import { DebtsService } from './debts.service';
// import { DebtsController } from './debts.controller';

// @Module({
//   providers: [DebtsService],
//   controllers: [DebtsController]
// })
// export class DebtsModule {}

import { Debt } from './entities/debt.entity';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Debt])],
  controllers: [DebtsController],
  providers: [DebtsService],
})
export class DebtsModule {}
