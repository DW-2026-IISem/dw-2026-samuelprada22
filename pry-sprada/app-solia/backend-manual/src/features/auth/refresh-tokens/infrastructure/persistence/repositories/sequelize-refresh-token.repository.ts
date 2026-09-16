import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { Status } from '../../../../../../common/enums/status.enum.js';

import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';

import { REFRESH_TOKEN_REPOSITORY } from '../../../domain/interfaces/refresh-token-repository.interface.js';
import type { IRefreshTokenRepository } from '../../../domain/interfaces/refresh-token-repository.interface.js';

import { RefreshTokenModel } from '../models/refresh-token.model.js';

import { RefreshTokenMapper } from '../../../application/mappers/refresh-token.mapper.js';

@Injectable()
export class SequelizeRefreshTokenRepository
  implements IRefreshTokenRepository
{
  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const model = await RefreshTokenModel.create(
      RefreshTokenMapper.toPersistence(refreshToken),
    );

    return RefreshTokenMapper.toDomain(model);
  }

  async findValidByToken(token: string): Promise<RefreshToken | null> {
    const model = await RefreshTokenModel.findOne({
      where: {
        token,
        isValid: Status.ACTIVE,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    return model ? RefreshTokenMapper.toDomain(model) : null;
  }

  async invalidate(id: number): Promise<void> {
    await RefreshTokenModel.update(
      {
        isValid: Status.INACTIVE,
      },
      {
        where: { id },
      },
    );
  }

  async invalidateAllForUser(userId: number): Promise<void> {
    await RefreshTokenModel.update(
      {
        isValid: Status.INACTIVE,
      },
      {
        where: {
          userId,
          isValid: Status.ACTIVE,
        },
      },
    );
  }
}

export const refreshTokenRepositoryProvider = {
  provide: REFRESH_TOKEN_REPOSITORY,
  useClass: SequelizeRefreshTokenRepository,
};
