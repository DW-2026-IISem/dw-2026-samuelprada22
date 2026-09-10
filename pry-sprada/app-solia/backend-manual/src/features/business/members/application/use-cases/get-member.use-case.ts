import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundException } from '../../domain/exceptions/member-not-found.exception.js';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../domain/interfaces/member-repository.interface.js';
import { MemberMapper } from '../mappers/member.mapper.js';

@Injectable()
export class GetMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(id: number) {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundException(id);
    }

    return MemberMapper.toResponse(member);
  }
}
