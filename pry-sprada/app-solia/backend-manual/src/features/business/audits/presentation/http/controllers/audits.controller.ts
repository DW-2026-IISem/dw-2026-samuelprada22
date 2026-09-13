import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateAuditUseCase } from '../../../application/use-cases/create-audit.use-case.js';
import { GetAuditUseCase } from '../../../application/use-cases/get-audit.use-case.js';
import { ListAuditsUseCase } from '../../../application/use-cases/list-audits.use-case.js';

import { CreateAuditDto } from '../../../application/dto/create-audit.dto.js';
import { AuditFilterDto } from '../../../application/dto/audit-filter.dto.js';

import { AuditSerializer } from '../serializers/audit.serializer.js';

@Controller('audits')
export class AuditsController {
  constructor(
    private readonly createUseCase: CreateAuditUseCase,
    private readonly getUseCase: GetAuditUseCase,
    private readonly listUseCase: ListAuditsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateAuditDto) {
    const result = await this.createUseCase.execute(dto);

    return AuditSerializer.serialize(result);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.getUseCase.execute(id);

    return AuditSerializer.serialize(result);
  }

  @Get()
  async list(@Query() dto: AuditFilterDto) {
    const result = await this.listUseCase.execute(dto);

    return {
      ...result,
      items: result.items.map((item) =>
        AuditSerializer.serialize(item),
      ),
    };
  }
}
