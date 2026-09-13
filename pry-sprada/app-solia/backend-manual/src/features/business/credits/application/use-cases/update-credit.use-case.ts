import { Inject, Injectable } from '@nestjs/common';
import { CreditNotFoundException } from '../../domain/exceptions/credit-not-found.exception.js';
import {
  CREDIT_REPOSITORY,
  type ICreditRepository,
} from '../../domain/interfaces/credit-repository.interface.js';
import { UpdateCreditDto } from '../dto/update-credit.dto.js';
import { CreditMapper } from '../mappers/credit.mapper.js';

@Injectable()
export class UpdateCreditUseCase {
  constructor(
    @Inject(CREDIT_REPOSITORY)
    private readonly creditRepository: ICreditRepository,
  ) {}

  async execute(id: number, dto: UpdateCreditDto) {
    const credit = await this.creditRepository.findById(id);

    if (!credit) {
      throw new CreditNotFoundException(id);
    }

    credit.update({
      creditApplicationId: dto.creditApplicationId,
      rateId: dto.rateId,
      date: dto.date ? new Date(dto.date) : undefined,
      amount: dto.amount,
      observations: dto.observations,
    });

    const updated = await this.creditRepository.update(credit);

    return CreditMapper.toResponse(updated);
  }
}
