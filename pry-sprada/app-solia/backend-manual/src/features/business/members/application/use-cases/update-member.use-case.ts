import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundException } from '../../domain/exceptions/member-not-found.exception.js';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../domain/interfaces/member-repository.interface.js';
import { UpdateMemberDto } from '../dto/update-member.dto.js';
import { MemberMapper } from '../mappers/member.mapper.js';

@Injectable()
export class UpdateMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(id: number, dto: UpdateMemberDto) {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundException(id);
    }

    member.update({
      name: dto.name,
      description: dto.description,
    });

    const updated = await this.memberRepository.update(member);

    return MemberMapper.toResponse(updated);
  }
}
