import { Inject, Injectable } from '@nestjs/common';
import { InstallmentNotFoundException } from '../../domain/exceptions/installment-not-found.exception.js';
import {
  type IInstallmentRepository,
  INSTALLMENT_REPOSITORY,
} from '../../domain/interfaces/installment-repository.interface.js';
import { UpdateInstallmentDto } from '../dto/update-installment.dto.js';
import { InstallmentMapper } from '../mappers/installment.mapper.js';

@Injectable()
export class UpdateInstallmentUseCase {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(id: number, dto: UpdateInstallmentDto) {
    const installment =
      await this.installmentRepository.findById(id);

    if (!installment) {
      throw new InstallmentNotFoundException(id);
    }

    installment.update(dto);

    const updated =
      await this.installmentRepository.update(installment);

    return InstallmentMapper.toResponse(updated);
  }
}
