import { MovementModel } from '../models/movement.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedMovements(): Promise<void> {
  const count = await MovementModel.count();

  if (count > 0) {
    return;
  }

  await MovementModel.bulkCreate([
    {
      accountId: 1,
      type: 'APORTE',
      date: new Date(),
      amount: 50000,
      observations: 'Aporte inicial registrado en la cuenta de ahorros',
      status: Status.ACTIVE,
    },
    {
      accountId: 1,
      type: 'ABONO',
      date: new Date(),
      amount: 100000,
      observations: 'Abono de prueba a la cuenta de ahorros',
      status: Status.ACTIVE,
    },
    {
      accountId: 2,
      type: 'APORTE',
      date: new Date(),
      amount: 75000,
      observations: 'Aporte inicial registrado en la cuenta de aportes',
      status: Status.ACTIVE,
    },
  ]);
}
