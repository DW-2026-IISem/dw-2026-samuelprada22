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
import { CreateCreditDto } from '../../../application/dto/create-credit.dto.js';
import { UpdateCreditDto } from '../../../application/dto/update-credit.dto.js';
import { CreditFilterDto } from '../../../application/dto/credit-filter.dto.js';
import { CreditResponseDto } from '../../../application/dto/credit-response.dto.js';
import { CreateCreditUseCase } from '../../../application/use-cases/create-credit.use-case.js';
import { UpdateCreditUseCase } from '../../../application/use-cases/update-credit.use-case.js';
import { DeleteCreditUseCase } from '../../../application/use-cases/delete-credit.use-case.js';
import { GetCreditUseCase } from '../../../application/use-cases/get-credit.use-case.js';
import { ListCreditsUseCase } from '../../../application/use-cases/list-credits.use-case.js';

@ApiTags('Credits')
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly createCreditUseCase: CreateCreditUseCase,
    private readonly updateCreditUseCase: UpdateCreditUseCase,
    private readonly deleteCreditUseCase: DeleteCreditUseCase,
    private readonly getCreditUseCase: GetCreditUseCase,
    private readonly listCreditsUseCase: ListCreditsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un crédito' })
  @ApiCreatedResponse({ type: CreditResponseDto })
  create(@Body() dto: CreateCreditDto) {
    return this.createCreditUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar créditos' })
  @ApiOkResponse({ type: [CreditResponseDto] })
  findAll(@Query() filter: CreditFilterDto) {
    return this.listCreditsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un crédito por ID' })
  @ApiOkResponse({ type: CreditResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getCreditUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un crédito' })
  @ApiOkResponse({ type: CreditResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateCreditDto,
  ) {
    return this.updateCreditUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un crédito' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteCreditUseCase.execute(id);
  }
}
