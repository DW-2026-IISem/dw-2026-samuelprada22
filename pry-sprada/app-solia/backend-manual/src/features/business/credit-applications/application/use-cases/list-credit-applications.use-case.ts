import { Inject, Injectable } from '@nestjs/common';
import {
  type ICreditApplicationRepository,
  CREDIT_APPLICATION_REPOSITORY,
} from '../../domain/interfaces/credit-application-repository.interface.js';
import { CreditApplicationFilterDto } from '../dto/credit-application-filter.dto.js';
import { CreditApplicationMapper } from '../mappers/credit-application.mapper.js';

@Injectable()
export class ListCreditApplicationsUseCase {
  constructor(
    @Inject(CREDIT_APPLICATION_REPOSITORY)
    private readonly creditApplicationRepository: ICreditApplicationRepository,
  ) {}

  async execute(filter: CreditApplicationFilterDto) {
    const result =
      await this.creditApplicationRepository.findAll(filter);

    return {
      items: result.items.map((creditApplication) =>
        CreditApplicationMapper.toResponse(creditApplication),
      ),
      meta: result.meta,
    };
  }
}
