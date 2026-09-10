import { Status } from '../../../../../common/enums/status.enum.js';
import { Member } from '../../domain/entities/member.entity.js';
import { MemberResponseDto } from '../dto/member-response.dto.js';
import { MemberModel } from '../../infrastructure/persistence/models/member.model.js';

export class MemberMapper {
  static toDomain(model: MemberModel): Member {
    return Member.reconstitute({
      id: model.id,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(entity: Member): MemberResponseDto {
    return {
      id: entity.id!,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(entity: Member): Partial<MemberModel> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
