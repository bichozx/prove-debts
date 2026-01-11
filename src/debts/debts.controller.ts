// import { Controller } from '@nestjs/common';

// @Controller('debts')
// export class DebtsController {}

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DebtsService } from './debts.service';
import type { RequestWithUser } from '../common/request-with-user.interface';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Debts')
@ApiBearerAuth()
@Controller('debts')
@UseGuards(JwtAuthGuard)
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  // ✅ Crear deuda
  @Post()
  create(@Body() dto: CreateDebtDto, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.debtsService.createDebt(dto, { id: user.userId } as any);
  }

  // ✅ Listar deudas del usuario autenticado
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.debtsService.findAllByUser(user.userId);
  }

  // ✅ Actualizar deuda (solo si no está pagada)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.debtsService.updateDebt(id, dto, user.userId);
  }

  // ✅ Marcar como pagada
  @Patch(':id/pay')
  pay(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.debtsService.markAsPaid(id, user.userId);
  }
}
