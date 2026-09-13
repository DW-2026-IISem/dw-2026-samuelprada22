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
import { CreateInstallmentPaymentDto } from '../../../application/dto/create-installment-payment.dto.js';
import { UpdateInstallmentPaymentDto } from '../../../application/dto/update-installment-payment.dto.js';
import { InstallmentPaymentFilterDto } from '../../../application/dto/installment-payment-filter.dto.js';
import { InstallmentPaymentResponseDto } from '../../../application/dto/installment-payment-response.dto.js';
import { CreateInstallmentPaymentUseCase } from '../../../application/use-cases/create-installment-payment.use-case.js';
import { UpdateInstallmentPaymentUseCase } from '../../../application/use-cases/update-installment-payment.use-case.js';
import { DeleteInstallmentPaymentUseCase } from '../../../application/use-cases/delete-installment-payment.use-case.js';
import { GetInstallmentPaymentUseCase } from '../../../application/use-cases/get-installment-payment.use-case.js';
import { ListInstallmentPaymentsUseCase } from '../../../application/use-cases/list-installment-payments.use-case.js';

@ApiTags('Installment Payments')
@Controller('installment-payments')
export class InstallmentPaymentsController {
  constructor(
    private readonly createInstallmentPaymentUseCase: CreateInstallmentPaymentUseCase,
    private readonly updateInstallmentPaymentUseCase: UpdateInstallmentPaymentUseCase,
    private readonly deleteInstallmentPaymentUseCase: DeleteInstallmentPaymentUseCase,
    private readonly getInstallmentPaymentUseCase: GetInstallmentPaymentUseCase,
    private readonly listInstallmentPaymentsUseCase: ListInstallmentPaymentsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pago de cuota' })
  @ApiCreatedResponse({ type: InstallmentPaymentResponseDto })
  create(@Body() dto: CreateInstallmentPaymentDto) {
    return this.createInstallmentPaymentUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagos de cuota' })
  @ApiOkResponse({ type: [InstallmentPaymentResponseDto] })
  findAll(@Query() filter: InstallmentPaymentFilterDto) {
    return this.listInstallmentPaymentsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago de cuota por ID' })
  @ApiOkResponse({ type: InstallmentPaymentResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getInstallmentPaymentUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pago de cuota' })
  @ApiOkResponse({ type: InstallmentPaymentResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateInstallmentPaymentDto,
  ) {
    return this.updateInstallmentPaymentUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un pago de cuota' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteInstallmentPaymentUseCase.execute(id);
  }
}
