import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParsePositiveIntPipe } from '../../../../../../common/pipes/parse-positive-int.pipe.js';
import { CreateMovementDto } from '../../../application/dto/create-movement.dto.js';
import { UpdateMovementDto } from '../../../application/dto/update-movement.dto.js';
import { MovementFilterDto } from '../../../application/dto/movement-filter.dto.js';
import { MovementResponseDto } from '../../../application/dto/movement-response.dto.js';
import { CreateMovementUseCase } from '../../../application/use-cases/create-movement.use-case.js';
import { UpdateMovementUseCase } from '../../../application/use-cases/update-movement.use-case.js';
import { DeleteMovementUseCase } from '../../../application/use-cases/delete-movement.use-case.js';
import { GetMovementUseCase } from '../../../application/use-cases/get-movement.use-case.js';
import { ListMovementsUseCase } from '../../../application/use-cases/list-movements.use-case.js';

@ApiTags('Movements')
@Controller('movements')
export class MovementsController {
  constructor(
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly updateMovementUseCase: UpdateMovementUseCase,
    private readonly deleteMovementUseCase: DeleteMovementUseCase,
    private readonly getMovementUseCase: GetMovementUseCase,
    private readonly listMovementsUseCase: ListMovementsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un movimiento' })
  @ApiCreatedResponse({ type: MovementResponseDto })
  create(@Body() dto: CreateMovementDto) {
    return this.createMovementUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimientos' })
  @ApiOkResponse({ type: [MovementResponseDto] })
  findAll(@Query() filter: MovementFilterDto) {
    return this.listMovementsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiOkResponse({ type: MovementResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getMovementUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un movimiento' })
  @ApiOkResponse({ type: MovementResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateMovementDto,
  ) {
    return this.updateMovementUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un movimiento' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteMovementUseCase.execute(id);
  }
}
