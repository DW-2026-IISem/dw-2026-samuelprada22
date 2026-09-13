import { Inject, Injectable } from '@nestjs/common';
import { RateNotFoundException } from '../../domain/exceptions/rate-not-found.exception.js';
import {
  type IRateRepository,
  RATE_REPOSITORY,
} from '../../domain/interfaces/rate-repository.interface.js';

@Injectable()
export class DeleteRateUseCase {
  constructor(
    @Inject(RATE_REPOSITORY)
    private readonly rateRepository: IRateRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const rate = await this.rateRepository.findById(id);

    if (!rate) {
      throw new RateNotFoundException(id);
    }

    await this.rateRepository.delete(id);
  }
}
