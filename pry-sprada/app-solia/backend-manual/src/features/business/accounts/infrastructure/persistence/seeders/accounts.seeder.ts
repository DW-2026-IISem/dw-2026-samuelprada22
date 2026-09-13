import { AccountModel } from '../models/account.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedAccounts(): Promise<void> {
  const count = await AccountModel.count();

  if (count > 0) {
    return;
  }

  await AccountModel.bulkCreate([
    {
      memberId: 1,
      name: 'Cuenta de Ahorros',
      description: 'Cuenta destinada al ahorro del socio Juan Pérez',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      memberId: 1,
      name: 'Cuenta de Aportes',
      description: 'Cuenta para registrar los aportes del socio Juan Pérez',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      memberId: 2,
      name: 'Cuenta de Ahorros',
      description: 'Cuenta destinada al ahorro de la socia María García',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
