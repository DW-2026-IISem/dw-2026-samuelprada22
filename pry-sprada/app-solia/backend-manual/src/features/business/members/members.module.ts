import { Module } from '@nestjs/common';
import { MEMBER_REPOSITORY } from './domain/interfaces/member-repository.interface.js';
import { MemberRepository } from './infrastructure/persistence/repositories/member.repository.js';
import { CreateMemberUseCase } from './application/use-cases/create-member.use-case.js';
import { UpdateMemberUseCase } from './application/use-cases/update-member.use-case.js';
import { DeleteMemberUseCase } from './application/use-cases/delete-member.use-case.js';
import { GetMemberUseCase } from './application/use-cases/get-member.use-case.js';
import { ListMembersUseCase } from './application/use-cases/list-members.use-case.js';
import { MembersController } from './presentation/http/controllers/members.controller.js';

@Module({
  controllers: [MembersController],
  providers: [
    MemberRepository,
    { provide: MEMBER_REPOSITORY, useExisting: MemberRepository },
    CreateMemberUseCase,
    UpdateMemberUseCase,
    DeleteMemberUseCase,
    GetMemberUseCase,
    ListMembersUseCase,
  ],
  exports: [MEMBER_REPOSITORY],
})
export class MembersModule {}
