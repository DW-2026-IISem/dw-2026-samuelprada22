import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

import { SEQUELIZE_TOKEN } from '../../../../common/constants/database.constants.js';

import { RefreshTokenModel } from '../../refresh-tokens/infrastructure/persistence/models/refresh-token.model.js';
import { ResourceRoleModel } from '../../resource-roles/infrastructure/persistence/models/resource-role.model.js';
import { ResourceModel } from '../../resources/infrastructure/persistence/models/resource.model.js';
import { RoleUserModel } from '../../role-users/infrastructure/persistence/models/role-user.model.js';
import { RoleModel } from '../../roles/infrastructure/persistence/models/role.model.js';
import { UserModel } from '../../users/infrastructure/persistence/models/user.model.js';

export const AUTH_MODELS = [
  UserModel,
  RoleModel,
  RoleUserModel,
  ResourceModel,
  ResourceRoleModel,
  RefreshTokenModel,
];

export const sequelizeProvider: Provider = {
  provide: SEQUELIZE_TOKEN,

  useFactory: async (configService: ConfigService) => {
    const dbConfig = configService.get('environment.database');

    const sequelize = new Sequelize({
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,

      logging:
        configService.get('environment.app.nodeEnv') === 'development',

      define: {
        underscored: false,
        freezeTableName: true,
      },
    });

    sequelize.addModels(AUTH_MODELS);

    await sequelize.authenticate();

    await sequelize.sync();

    return sequelize;
  },

  inject: [ConfigService],
};
