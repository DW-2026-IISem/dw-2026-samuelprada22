import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { InstallmentPayment } from '../entities/installment-payment.entity.js';

export const INSTALLMENT_PAYMENT_REPOSITORY =
  'INSTALLMENT_PAYMENT_REPOSITORY';

export interface InstallmentPaymentFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IInstallmentPaymentRepository {
  create(
    installmentPayment: InstallmentPayment,
  ): Promise<InstallmentPayment>;

  update(
    installmentPayment: InstallmentPayment,
  ): Promise<InstallmentPayment>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<InstallmentPayment | null>;

  findAll(
    params: InstallmentPaymentFindAllParams,
  ): Promise<PaginatedResult<InstallmentPayment>>;
}
