import { Inject, Injectable } from '@nestjs/common';
import { MemberNotFoundException } from '../../domain/exceptions/member-not-found.exception.js';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../domain/interfaces/member-repository.interface.js';

@Injectable()
export class DeleteMemberUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const member = await this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundException(id);
    }

    await this.memberRepository.delete(id);
  }
}
