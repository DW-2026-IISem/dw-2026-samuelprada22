import { Inject, Injectable } from '@nestjs/common';
import { CreditApplicationNotFoundException } from '../../domain/exceptions/credit-application-not-found.exception.js';
import {
  CREDIT_APPLICATION_REPOSITORY,
  type ICreditApplicationRepository,
} from '../../domain/interfaces/credit-application-repository.interface.js';
import { MemberNotFoundException } from '../../../members/domain/exceptions/member-not-found.exception.js';
import {
  MEMBER_REPOSITORY,
  type IMemberRepository,
} from '../../../members/domain/interfaces/member-repository.interface.js';
import { CreditApplication } from '../../domain/entities/credit-application.entity.js';
import { CreateCreditApplicationDto } from '../dto/create-credit-application.dto.js';
import { CreditApplicationMapper } from '../mappers/credit-application.mapper.js';

@Injectable()
export class CreateCreditApplicationUseCase {
  constructor(
    @Inject(CREDIT_APPLICATION_REPOSITORY)
    private readonly creditApplicationRepository: ICreditApplicationRepository,

    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
  ) {}

  async execute(dto: CreateCreditApplicationDto) {
    const member = await this.memberRepository.findById(dto.memberId);

    if (!member) {
      throw new MemberNotFoundException(dto.memberId);
    }

    const creditApplication = CreditApplication.create({
      memberId: dto.memberId,
      date: new Date(dto.date),
      amount: dto.amount,
      observations: dto.observations,
    });

    const created =
      await this.creditApplicationRepository.create(creditApplication);

    return CreditApplicationMapper.toResponse(created);
  }
}
