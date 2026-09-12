import { InstallmentModel } from '../models/installment.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedInstallments(): Promise<void> {
  const count = await InstallmentModel.count();

  if (count > 0) {
    return;
  }

  await InstallmentModel.bulkCreate([
    {
      name: 'Cuota mensual',
      description: 'Cuota mensual para obligaciones de crédito',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      name: 'Cuota extraordinaria',
      description: 'Cuota extraordinaria asociada a una obligación de crédito',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
