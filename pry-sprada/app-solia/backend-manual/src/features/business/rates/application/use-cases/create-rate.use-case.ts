import { Inject, Injectable } from '@nestjs/common';
import { Rate } from '../../domain/entities/rate.entity.js';
import {
  type IRateRepository,
  RATE_REPOSITORY,
} from '../../domain/interfaces/rate-repository.interface.js';
import { CreateRateDto } from '../dto/create-rate.dto.js';
import { RateMapper } from '../mappers/rate.mapper.js';

@Injectable()
export class CreateRateUseCase {
  constructor(
    @Inject(RATE_REPOSITORY)
    private readonly rateRepository: IRateRepository,
  ) {}

  async execute(dto: CreateRateDto) {
    const rate = Rate.create(dto);

    const created = await this.rateRepository.create(rate);

    return RateMapper.toResponse(created);
  }
}
