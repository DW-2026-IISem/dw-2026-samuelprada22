import { Inject, Injectable } from '@nestjs/common';
import {
  type IInstallmentRepository,
  INSTALLMENT_REPOSITORY,
} from '../../domain/interfaces/installment-repository.interface.js';
import { InstallmentFilterDto } from '../dto/installment-filter.dto.js';
import { InstallmentMapper } from '../mappers/installment.mapper.js';

@Injectable()
export class ListInstallmentsUseCase {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(filter: InstallmentFilterDto) {
    const result =
      await this.installmentRepository.findAll(filter);

    return {
      items: result.items.map((installment) =>
        InstallmentMapper.toResponse(installment),
      ),
      meta: result.meta,
    };
  }
}
