import { Inject, Injectable } from '@nestjs/common';
import { Installment } from '../../domain/entities/installment.entity.js';
import {
  type IInstallmentRepository,
  INSTALLMENT_REPOSITORY,
} from '../../domain/interfaces/installment-repository.interface.js';
import { CreateInstallmentDto } from '../dto/create-installment.dto.js';
import { InstallmentMapper } from '../mappers/installment.mapper.js';

@Injectable()
export class CreateInstallmentUseCase {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(dto: CreateInstallmentDto) {
    const installment = Installment.create(dto);

    const created =
      await this.installmentRepository.create(installment);

    return InstallmentMapper.toResponse(created);
  }
}
