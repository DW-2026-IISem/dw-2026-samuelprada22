import { Inject, Injectable } from '@nestjs/common';
import {
  CREDIT_REPOSITORY,
  type ICreditRepository,
} from '../../domain/interfaces/credit-repository.interface.js';
import { CreditFilterDto } from '../dto/credit-filter.dto.js';
import { CreditMapper } from '../mappers/credit.mapper.js';

@Injectable()
export class ListCreditsUseCase {
  constructor(
    @Inject(CREDIT_REPOSITORY)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async execute(filter: CreditFilterDto) {
    const result = await this.creditRepository.findAll(filter);

    return {
      items: result.items.map((credit) =>
        CreditMapper.toResponse(credit),
      ),
      meta: result.meta,
    };
  }
}
