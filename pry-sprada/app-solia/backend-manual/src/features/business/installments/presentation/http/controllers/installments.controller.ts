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
import { CreateInstallmentDto } from '../../../application/dto/create-installment.dto.js';
import { UpdateInstallmentDto } from '../../../application/dto/update-installment.dto.js';
import { InstallmentFilterDto } from '../../../application/dto/installment-filter.dto.js';
import { InstallmentResponseDto } from '../../../application/dto/installment-response.dto.js';
import { CreateInstallmentUseCase } from '../../../application/use-cases/create-installment.use-case.js';
import { UpdateInstallmentUseCase } from '../../../application/use-cases/update-installment.use-case.js';
import { DeleteInstallmentUseCase } from '../../../application/use-cases/delete-installment.use-case.js';
import { GetInstallmentUseCase } from '../../../application/use-cases/get-installment.use-case.js';
import { ListInstallmentsUseCase } from '../../../application/use-cases/list-installments.use-case.js';

@ApiTags('Installments')
@Controller('installments')
export class InstallmentsController {
  constructor(
    private readonly createInstallmentUseCase: CreateInstallmentUseCase,
    private readonly updateInstallmentUseCase: UpdateInstallmentUseCase,
    private readonly deleteInstallmentUseCase: DeleteInstallmentUseCase,
    private readonly getInstallmentUseCase: GetInstallmentUseCase,
    private readonly listInstallmentsUseCase: ListInstallmentsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una cuota' })
  @ApiCreatedResponse({ type: InstallmentResponseDto })
  create(@Body() dto: CreateInstallmentDto) {
    return this.createInstallmentUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cuotas' })
  @ApiOkResponse({ type: [InstallmentResponseDto] })
  findAll(@Query() filter: InstallmentFilterDto) {
    return this.listInstallmentsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuota por ID' })
  @ApiOkResponse({ type: InstallmentResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getInstallmentUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuota' })
  @ApiOkResponse({ type: InstallmentResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateInstallmentDto,
  ) {
    return this.updateInstallmentUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuota' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteInstallmentUseCase.execute(id);
  }
}
