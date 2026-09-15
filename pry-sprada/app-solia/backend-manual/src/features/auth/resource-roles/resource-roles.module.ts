import { Module } from '@nestjs/common';

import { ResourcesModule } from '../resources/resources.module.js';
import { RolesModule } from '../roles/roles.module.js';

import { AssignResourceRoleUseCase } from './application/use-cases/assign-resource-role.use-case.js';
import { ListResourceRolesUseCase } from './application/use-cases/list-resource-roles.use-case.js';
import { RevokeResourceRoleUseCase } from './application/use-cases/revoke-resource-role.use-case.js';

import {
  resourceRoleRepositoryProvider,
} from './infrastructure/persistence/repositories/sequelize-resource-role.repository.js';

import { ResourceRolesController } from './presentation/http/controllers/resource-roles.controller.js';

@Module({
  imports: [
    ResourcesModule,
    RolesModule,
  ],
  controllers: [
    ResourceRolesController,
  ],
  providers: [
    resourceRoleRepositoryProvider,
    AssignResourceRoleUseCase,
    RevokeResourceRoleUseCase,
    ListResourceRolesUseCase,
  ],
  exports: [
    resourceRoleRepositoryProvider,
  ],
})
export class ResourceRolesModule {}
