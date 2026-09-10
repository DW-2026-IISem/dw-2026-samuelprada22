import { Inject, Injectable } from '@nestjs/common';
import { Member } from '../../domain/entities/member.entity.js';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../domain/interfaces/member-repository.interface.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { MemberMapper } from '../mappers/member.mapper.js';

@Injectable()
export class CreateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(dto: CreateMemberDto) {
    const member = Member.create({
      name: dto.name,
      description: dto.description,
    });

    const created = await this.memberRepository.create(member);

    return MemberMapper.toResponse(created);
  }
}
