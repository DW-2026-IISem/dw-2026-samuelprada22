import { Status } from '../../../../../common/enums/status.enum.js';

export class DecisionCommitteeResponseDto {
  id: number;
  referenceId: number;
  name: string;
  description?: string;
  isActive: boolean;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}
