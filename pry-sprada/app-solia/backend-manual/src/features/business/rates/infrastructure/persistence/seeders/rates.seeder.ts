import { RateModel } from '../models/rate.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedRates(): Promise<void> {
  const count = await RateModel.count();

  if (count > 0) {
    return;
  }

  await RateModel.bulkCreate([
    {
      name: 'Tasa ordinaria',
      description: 'Tasa de interés ordinaria para operaciones de crédito',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      name: 'Tasa especial',
      description: 'Tasa de interés especial para operaciones autorizadas',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
