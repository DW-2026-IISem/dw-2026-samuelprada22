import { Inject, Injectable } from '@nestjs/common';
import { Status } from '../../../../../common/enums/status.enum.js';
import { CreditApplicationNotFoundException } from '../../domain/exceptions/credit-application-not-found.exception.js';
import {
  type ICreditApplicationRepository,
  CREDIT_APPLICATION_REPOSITORY,
} from '../../domain/interfaces/credit-application-repository.interface.js';
import { CreditApplicationMapper } from '../mappers/credit-application.mapper.js';

@Injectable()
export class CancelCreditApplicationUseCase {
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

    if (creditApplication.status === Status.INACTIVE) {
      return CreditApplicationMapper.toResponse(creditApplication);
    }

    creditApplication.deactivate();

    const updated =
      await this.creditApplicationRepository.update(creditApplication);

    return CreditApplicationMapper.toResponse(updated);
  }
}
