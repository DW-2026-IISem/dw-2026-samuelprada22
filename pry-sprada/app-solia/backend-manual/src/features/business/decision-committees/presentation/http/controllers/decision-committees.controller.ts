import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateDecisionCommitteeUseCase } from '../../../application/use-cases/create-decision-committee.use-case.js';
import { DeleteDecisionCommitteeUseCase } from '../../../application/use-cases/delete-decision-committee.use-case.js';
import { GetDecisionCommitteeUseCase } from '../../../application/use-cases/get-decision-committee.use-case.js';
import { ListDecisionCommitteesUseCase } from '../../../application/use-cases/list-decision-committees.use-case.js';
import { UpdateDecisionCommitteeUseCase } from '../../../application/use-cases/update-decision-committee.use-case.js';

import { CreateDecisionCommitteeDto } from '../../../application/dto/create-decision-committee.dto.js';
import { DecisionCommitteeFilterDto } from '../../../application/dto/decision-committee-filter.dto.js';
import { UpdateDecisionCommitteeDto } from '../../../application/dto/update-decision-committee.dto.js';

import { DecisionCommitteeSerializer } from '../serializers/decision-committee.serializer.js';

@Controller('decision-committees')
export class DecisionCommitteesController {
  constructor(
    private readonly createUseCase: CreateDecisionCommitteeUseCase,
    private readonly updateUseCase: UpdateDecisionCommitteeUseCase,
    private readonly deleteUseCase: DeleteDecisionCommitteeUseCase,
    private readonly getUseCase: GetDecisionCommitteeUseCase,
    private readonly listUseCase: ListDecisionCommitteesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateDecisionCommitteeDto) {
    const result = await this.createUseCase.execute(dto);

    return DecisionCommitteeSerializer.serialize(result);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDecisionCommitteeDto,
  ) {
    const result = await this.updateUseCase.execute(id, dto);

    return DecisionCommitteeSerializer.serialize(result);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.deleteUseCase.execute(id);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.getUseCase.execute(id);

    return DecisionCommitteeSerializer.serialize(result);
  }

  @Get()
  async list(@Query() dto: DecisionCommitteeFilterDto) {
    const result = await this.listUseCase.execute(dto);

    return {
      ...result,
      items: result.items.map((item) =>
        DecisionCommitteeSerializer.serialize(item),
      ),
    };
  }
}
