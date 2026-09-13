import { CreditModel } from '../models/credit.model.js';
import { CreditApplicationModel } from '../../../../credit-applications/infrastructure/persistence/models/credit-application.model.js';
import { RateModel } from '../../../../rates/infrastructure/persistence/models/rate.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedCredits(): Promise<void> {
  const count = await CreditModel.count();

  if (count > 0) {
    return;
  }

  const creditApplication = await CreditApplicationModel.findByPk(1);

  if (!creditApplication) {
    return;
  }

  const rate = await RateModel.findByPk(1);

  if (!rate) {
    return;
  }

  await CreditModel.create({
    creditApplicationId: creditApplication.id,
    rateId: rate.id,
    date: new Date(),
    amount: creditApplication.amount,
    status: Status.ACTIVE,
    observations: 'Crédito inicial para desarrollo',
  });
}
