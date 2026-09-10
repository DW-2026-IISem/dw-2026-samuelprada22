import { Status } from '../../../../../../common/enums/status.enum.js';
import { MemberModel } from '../models/member.model.js';

export async function seedMembers(): Promise<void> {
  const count = await MemberModel.count();

  if (count > 0) {
    return;
  }

  await MemberModel.bulkCreate([
    {
      name: 'Juan Pérez',
      description: 'Socio fundador de Solia',
      isActive: true,
      status: Status.ACTIVE,
    },
    {
      name: 'María García',
      description: 'Socia de Solia',
      isActive: true,
      status: Status.ACTIVE,
    },
  ]);
}
