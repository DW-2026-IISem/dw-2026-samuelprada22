import { Member } from '../../../domain/entities/member.entity.js';
import { MemberResponseDto } from '../../../application/dto/member-response.dto.js';
import { MemberMapper } from '../../../application/mappers/member.mapper.js';

export class MemberSerializer {
  static serialize(entity: Member): MemberResponseDto {
    return MemberMapper.toResponse(entity);
  }
}
