import { CreditApplicationModel } from '../models/credit-application.model.js';
import { MemberModel } from '../../../../members/infrastructure/persistence/models/member.model.js';
import { Status } from '../../../../../../common/enums/status.enum.js';

export async function seedCreditApplications(): Promise<void> {
  const count = await CreditApplicationModel.count();

  if (count > 0) {
    return;
  }

  const memberCount = await MemberModel.count();

  if (memberCount === 0) {
    return;
  }

  const member = await MemberModel.findByPk(1);

  if (!member) {
    return;
  }

  await CreditApplicationModel.create({
    memberId: member.id,
    date: new Date(),
    amount: 1000000,
    status: Status.ACTIVE,
    observations: 'Solicitud de crédito inicial para desarrollo',
  });
}
