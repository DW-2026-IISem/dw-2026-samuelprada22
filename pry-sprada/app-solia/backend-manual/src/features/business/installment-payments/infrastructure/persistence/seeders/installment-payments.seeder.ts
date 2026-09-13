import { InstallmentPaymentModel } from '../models/installment-payment.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedInstallmentPayments(): Promise<void> {
  const count = await InstallmentPaymentModel.count();

  if (count > 0) {
    return;
  }

  await InstallmentPaymentModel.bulkCreate([
    {
      installmentId: 1,
      name: 'Pago de cuota mensual',
      description: 'Registro de pago correspondiente a una cuota mensual',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      installmentId: 2,
      name: 'Pago de cuota extraordinaria',
      description: 'Registro de pago correspondiente a una cuota extraordinaria',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
