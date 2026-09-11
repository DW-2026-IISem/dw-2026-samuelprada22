import { Inject, Injectable } from '@nestjs/common';
import { CreditApplicationNotFoundException } from '../../domain/exceptions/credit-application-not-found.exception.js';
import {
  type ICreditApplicationRepository,
  CREDIT_APPLICATION_REPOSITORY,
} from '../../domain/interfaces/credit-application-repository.interface.js';
import { CreditApplicationMapper } from '../mappers/credit-application.mapper.js';

@Injectable()
export class GetCreditApplicationUseCase {
  constructor(
    @Inject(CREDIT_APPLICATION_REPOSITORY)
    private readonly creditApplicationRepository: ICreditApplicationRepository,
  ) {}

  async execute(id: number) {
    const creditApplication =
      await this.creditApplicationRepository.findById(id);

    if (!creditApplication) {
      throw new CreditApplicationNotFoundException(id);
    }

    return CreditApplicationMapper.toResponse(creditApplication);
  }
}
