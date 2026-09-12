import { Inject, Injectable } from '@nestjs/common';
import { Credit } from '../../domain/entities/credit.entity.js';
import {
  CREDIT_REPOSITORY,
  type ICreditRepository,
} from '../../domain/interfaces/credit-repository.interface.js';
import {
  CREDIT_APPLICATION_REPOSITORY,
  type ICreditApplicationRepository,
} from '../../../credit-applications/domain/interfaces/credit-application-repository.interface.js';
import { CreditNotFoundException } from '../../domain/exceptions/credit-not-found.exception.js';
import { CreateCreditDto } from '../dto/create-credit.dto.js';
import { CreditMapper } from '../mappers/credit.mapper.js';

@Injectable()
export class CreateCreditUseCase {
  constructor(
    @Inject(CREDIT_REPOSITORY)
    private readonly creditRepository: ICreditRepository,

    @Inject(CREDIT_APPLICATION_REPOSITORY)
    private readonly creditApplicationRepository: ICreditApplicationRepository,
  ) {}

  async execute(dto: CreateCreditDto) {
    const creditApplication =
      await this.creditApplicationRepository.findById(dto.referenceId);

    if (!creditApplication) {
      throw new CreditNotFoundException(dto.referenceId);
    }

    const credit = Credit.create({
      referenceId: dto.referenceId,
      date: new Date(dto.date),
      amount: dto.amount,
      observations: dto.observations,
    });

    const created = await this.creditRepository.create(credit);

    return CreditMapper.toResponse(created);
  }
}
