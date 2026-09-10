import { Account } from '../../../domain/entities/account.entity.js';
import { AccountResponseDto } from '../../../application/dto/account-response.dto.js';
import { AccountMapper } from '../../../application/mappers/account.mapper.js';

export class AccountSerializer {
  static serialize(entity: Account): AccountResponseDto {
    return AccountMapper.toResponse(entity);
  }
}
