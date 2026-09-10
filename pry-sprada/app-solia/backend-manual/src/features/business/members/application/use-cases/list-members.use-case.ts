import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../domain/interfaces/member-repository.interface.js';
import { MemberFilterDto } from '../dto/member-filter.dto.js';
import { MemberMapper } from '../mappers/member.mapper.js';

@Injectable()
export class ListMembersUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(filter: MemberFilterDto) {
    const result = await this.memberRepository.findAll(filter);

    return {
      items: result.items.map((member) =>
        MemberMapper.toResponse(member),
      ),
      meta: result.meta,
    };
  }
}
