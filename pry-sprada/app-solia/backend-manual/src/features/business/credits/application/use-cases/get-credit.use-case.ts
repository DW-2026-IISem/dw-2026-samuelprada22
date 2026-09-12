import { Inject, Injectable } from '@nestjs/common';
import { CreditNotFoundException } from '../../domain/exceptions/credit-not-found.exception.js';
import {
  CREDIT_REPOSITORY,
  type ICreditRepository,
} from '../../domain/interfaces/credit-repository.interface.js';
import { CreditMapper } from '../mappers/credit.mapper.js';

@Injectable()
export class GetCreditUseCase {
  constructor(
    @Inject(CREDIT_REPOSITORY)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async execute(id: number) {
    const credit = await this.creditRepository.findById(id);

    if (!credit) {
      throw new CreditNotFoundException(id);
    }

    return CreditMapper.toResponse(credit);
  }
}
