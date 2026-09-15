import { Module } from '@nestjs/common';

import { CreateResourceUseCase } from './application/use-cases/create-resource.use-case.js';
import { DeleteResourceUseCase } from './application/use-cases/delete-resource.use-case.js';
import { GetResourceUseCase } from './application/use-cases/get-resource.use-case.js';
import { ListResourcesUseCase } from './application/use-cases/list-resources.use-case.js';
import { UpdateResourceUseCase } from './application/use-cases/update-resource.use-case.js';

import { resourceRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-resource.repository.js';

import { ResourcesController } from './presentation/http/controllers/resources.controller.js';

@Module({
  controllers: [ResourcesController],
  providers: [
    resourceRepositoryProvider,
    CreateResourceUseCase,
    GetResourceUseCase,
    ListResourcesUseCase,
    UpdateResourceUseCase,
    DeleteResourceUseCase,
  ],
  exports: [resourceRepositoryProvider],
})
export class ResourcesModule {}
