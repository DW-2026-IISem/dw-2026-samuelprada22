import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Member } from '../entities/member.entity.js';

export const MEMBER_REPOSITORY = 'MEMBER_REPOSITORY';

export interface MemberFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IMemberRepository {
  create(member: Member): Promise<Member>;
  update(member: Member): Promise<Member>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Member | null>;
  findAll(params: MemberFindAllParams): Promise<PaginatedResult<Member>>;
}
