import { Inject, Injectable } from '@nestjs/common';
import { InstallmentNotFoundException } from '../../domain/exceptions/installment-not-found.exception.js';
import {
  type IInstallmentRepository,
  INSTALLMENT_REPOSITORY,
} from '../../domain/interfaces/installment-repository.interface.js';

@Injectable()
export class DeleteInstallmentUseCase {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: IInstallmentRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const installment =
      await this.installmentRepository.findById(id);

    if (!installment) {
      throw new InstallmentNotFoundException(id);
    }

    await this.installmentRepository.delete(id);
  }
}
