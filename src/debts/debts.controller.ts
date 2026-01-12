import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import type { RequestWithUser } from '../common/request-with-user.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Debts')
@ApiBearerAuth()
@Controller('debts')
@UseGuards(JwtAuthGuard) // 🔥 ESTO ES OBLIGATORIO
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@Body() dto: CreateDebtDto, @Req() req: RequestWithUser) {
    return this.debtsService.createDebt(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.debtsService.findAllByUserCached(req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDebtDto,
    @Req() req: RequestWithUser,
  ) {
    return this.debtsService.updateDebt(id, dto, req.user.userId);
  }

  @Patch(':id/pay')
  pay(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.debtsService.markAsPaid(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.debtsService.deleteDebt(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Export debts (JSON or CSV)' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @Get('export')
  async exportDebts(
    @Req() req: RequestWithUser,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response,
  ) {
    const { filename, content } = await this.debtsService.exportDebts(
      req.user.userId,
      format,
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      return res.send(content);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(content);
  }

  @Get('summary')
  getSummary(@Req() req: RequestWithUser) {
    return this.debtsService.getDebtSummary(req.user.userId);
  }
}
