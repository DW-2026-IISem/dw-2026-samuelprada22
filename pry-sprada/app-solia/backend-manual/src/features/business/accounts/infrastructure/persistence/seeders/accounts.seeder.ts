import { AccountModel } from '../models/account.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedAccounts(): Promise<void> {
  const count = await AccountModel.count();

  if (count > 0) {
    return;
  }

  await AccountModel.bulkCreate([
    {
      name: 'Cuenta de Ahorros',
      description: 'Cuenta destinada al ahorro de los socios de FondoSolidario',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      name: 'Cuenta de Aportes',
      description: 'Cuenta para registrar los aportes de los socios de FondoSolidario',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
