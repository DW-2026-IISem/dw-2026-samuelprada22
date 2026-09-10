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
import { CreateAccountDto } from '../../../application/dto/create-account.dto.js';
import { UpdateAccountDto } from '../../../application/dto/update-account.dto.js';
import { AccountFilterDto } from '../../../application/dto/account-filter.dto.js';
import { AccountResponseDto } from '../../../application/dto/account-response.dto.js';
import { CreateAccountUseCase } from '../../../application/use-cases/create-account.use-case.js';
import { UpdateAccountUseCase } from '../../../application/use-cases/update-account.use-case.js';
import { DeleteAccountUseCase } from '../../../application/use-cases/delete-account.use-case.js';
import { GetAccountUseCase } from '../../../application/use-cases/get-account.use-case.js';
import { ListAccountsUseCase } from '../../../application/use-cases/list-accounts.use-case.js';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly getAccountUseCase: GetAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una cuenta' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  create(@Body() dto: CreateAccountDto) {
    return this.createAccountUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cuentas' })
  @ApiOkResponse({ type: [AccountResponseDto] })
  findAll(@Query() filter: AccountFilterDto) {
    return this.listAccountsUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta por ID' })
  @ApiOkResponse({ type: AccountResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getAccountUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta' })
  @ApiOkResponse({ type: AccountResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.updateAccountUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuenta' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteAccountUseCase.execute(id);
  }
}
