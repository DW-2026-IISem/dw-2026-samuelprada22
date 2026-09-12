import { Inject, Injectable } from '@nestjs/common';
import { InstallmentNotFoundException } from '../../domain/exceptions/installment-not-found.exception.js';
import {
  type IInstallmentRepository,
  INSTALLMENT_REPOSITORY,
} from '../../domain/interfaces/installment-repository.interface.js';
import { InstallmentMapper } from '../mappers/installment.mapper.js';

@Injectable()
export class GetInstallmentUseCase {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(id: number) {
    const installment =
      await this.installmentRepository.findById(id);

    if (!installment) {
      throw new InstallmentNotFoundException(id);
    }

    return InstallmentMapper.toResponse(installment);
  }
}
