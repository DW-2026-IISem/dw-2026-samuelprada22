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
import { CreateMemberDto } from '../../../application/dto/create-member.dto.js';
import { UpdateMemberDto } from '../../../application/dto/update-member.dto.js';
import { MemberFilterDto } from '../../../application/dto/member-filter.dto.js';
import { MemberResponseDto } from '../../../application/dto/member-response.dto.js';
import { CreateMemberUseCase } from '../../../application/use-cases/create-member.use-case.js';
import { UpdateMemberUseCase } from '../../../application/use-cases/update-member.use-case.js';
import { DeleteMemberUseCase } from '../../../application/use-cases/delete-member.use-case.js';
import { GetMemberUseCase } from '../../../application/use-cases/get-member.use-case.js';
import { ListMembersUseCase } from '../../../application/use-cases/list-members.use-case.js';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(
    private readonly createMemberUseCase: CreateMemberUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
    private readonly deleteMemberUseCase: DeleteMemberUseCase,
    private readonly getMemberUseCase: GetMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un socio' })
  @ApiCreatedResponse({ type: MemberResponseDto })
  create(@Body() dto: CreateMemberDto) {
    return this.createMemberUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar socios' })
  @ApiOkResponse({ type: [MemberResponseDto] })
  findAll(@Query() filter: MemberFilterDto) {
    return this.listMembersUseCase.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un socio por ID' })
  @ApiOkResponse({ type: MemberResponseDto })
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.getMemberUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un socio' })
  @ApiOkResponse({ type: MemberResponseDto })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.updateMemberUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un socio' })
  @ApiNoContentResponse()
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.deleteMemberUseCase.execute(id);
  }
}
