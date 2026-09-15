import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';

import {
  CreateResourceDto,
  UpdateResourceDto,
} from '../../../application/dto/create-resource.dto.js';

import { CreateResourceUseCase } from '../../../application/use-cases/create-resource.use-case.js';
import { DeleteResourceUseCase } from '../../../application/use-cases/delete-resource.use-case.js';
import { GetResourceUseCase } from '../../../application/use-cases/get-resource.use-case.js';
import { ListResourcesUseCase } from '../../../application/use-cases/list-resources.use-case.js';
import { UpdateResourceUseCase } from '../../../application/use-cases/update-resource.use-case.js';

@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateResourceDto) {
    return this.createResourceUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.listResourcesUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getResourceUseCase.execute(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.updateResourceUseCase.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deleteResourceUseCase.execute(id);

    return {
      message: 'Recurso eliminado',
    };
  }
}
