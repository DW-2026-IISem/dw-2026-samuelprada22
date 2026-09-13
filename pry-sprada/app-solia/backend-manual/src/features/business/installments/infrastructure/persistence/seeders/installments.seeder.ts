import { InstallmentModel } from '../models/installment.model.js';
import { CreditModel } from '../../../../credits/infrastructure/persistence/models/credit.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedInstallments(): Promise<void> {
  const count = await InstallmentModel.count();

  if (count > 0) {
    return;
  }

  const credit = await CreditModel.findByPk(1);

  if (!credit) {
    return;
  }

  await InstallmentModel.bulkCreate([
    {
      creditId: credit.id,
      name: 'Cuota mensual',
      description: 'Cuota mensual para obligaciones de crédito',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      creditId: credit.id,
      name: 'Cuota extraordinaria',
      description: 'Cuota extraordinaria asociada a una obligación de crédito',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
