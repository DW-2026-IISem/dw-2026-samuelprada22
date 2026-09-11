import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParsePositiveIntPipe } from '../../../../../../common/pipes/parse-positive-int.pipe.js';
import { CreateCreditApplicationDto } from '../../../application/dto/create-credit-application.dto.js';
import { CreditApplicationFilterDto } from '../../../application/dto/credit-application-filter.dto.js';
import { CreditApplicationResponseDto } from '../../../application/dto/credit-application-response.dto.js';
import { CreateCreditApplicationUseCase } from '../../../application/use-cases/create-credit-application.use-case.js';
import { CancelCreditApplicationUseCase } from '../../../application/use-cases/cancel-credit-application.use-case.js';
import { GetCreditApplicationUseCase } from '../../../application/use-cases/get-credit-application.use-case.js';
import { ListCreditApplicationsUseCase } from '../../../application/use-cases/list-credit-applications.use-case.js';

@ApiTags('Credit Applications')
@Controller('credit-applications')
export class CreditApplicationsController {
  constructor(
    private readonly createCreditApplicationUseCase: CreateCreditApplicationUseCase,
    private readonly cancelCreditApplicationUseCase: CancelCreditApplicationUseCase,
    private readonly getCreditApplicationUseCase: GetCreditApplicationUseCase,
    private readonly listCreditApplicationsUseCase: ListCreditApplicationsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una solicitud de crédito' })
  @ApiCreatedResponse({ type: CreditApplicationResponseDto })
  create(@Body() dto: CreateCreditApplicationDto) {
    return this.createCreditApplicationUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes de crédito' })
  @ApiOkResponse({ type: [CreditApplicationResponseDto] })
  findAll(@Query() filter: CreditApplicationFilterDto) {
    return this.listCreditApplicationsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una solicitud de crédito por ID' })
  @ApiOkResponse({ type: CreditApplicationResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getCreditApplicationUseCase.execute(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una solicitud de crédito' })
  @ApiOkResponse({ type: CreditApplicationResponseDto })
  cancel(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.cancelCreditApplicationUseCase.execute(id);
  }
}
