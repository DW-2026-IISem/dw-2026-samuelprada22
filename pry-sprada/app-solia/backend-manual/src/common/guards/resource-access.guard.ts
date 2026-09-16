import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Status } from '../enums/status.enum';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RESOURCE_REPOSITORY } from '../../features/auth/resources/domain/interfaces/resource-repository.interface';
import type { IResourceRepository } from '../../features/auth/resources/domain/interfaces/resource-repository.interface';
import { RESOURCE_ROLE_REPOSITORY } from '../../features/auth/resource-roles/domain/interfaces/resource-role-repository.interface';
import type { IResourceRoleRepository } from '../../features/auth/resource-roles/domain/interfaces/resource-role-repository.interface';
import { ROLE_REPOSITORY } from '../../features/auth/roles/domain/interfaces/role-repository.interface';
import type { IRoleRepository } from '../../features/auth/roles/domain/interfaces/role-repository.interface';

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
    @Inject(RESOURCE_ROLE_REPOSITORY)
    private readonly resourceRoleRepository: IResourceRoleRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Acceso denegado');
    }

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

      if (!hasRole) {
        throw new ForbiddenException('No tiene permisos suficientes');
      }

      return true;
    }

    const method = request.method.toUpperCase();
    const path = this.normalizePath(request.route?.path ?? request.path);

    const resource = await this.resourceRepository.findByPathAndMethod(
      path,
      method,
    );

    if (!resource || resource.isActive !== Status.ACTIVE) {
      return true;
    }

    const userRoles = await this.roleRepository.findByIds(
      await this.getRoleIdsByNames(user.roles),
    );

    const roleIds = userRoles.map((r) => r.id!);

    if (roleIds.length === 0) {
      throw new ForbiddenException('Acceso denegado al recurso');
    }

    const permissions =
      await this.resourceRoleRepository.findByRoleIds(roleIds);

    const allowed = permissions.some(
      (p) => p.resourceId === resource.id && p.isActive === Status.ACTIVE,
    );

    if (!allowed) {
      throw new ForbiddenException('Acceso denegado al recurso');
    }

    return true;
  }

  private normalizePath(path: string): string {
    const apiPath = path.startsWith('/api') ? path : `/api${path}`;

    return apiPath.replace(/\/:\w+/g, '');
  }

  private async getRoleIdsByNames(roleNames: string[]): Promise<number[]> {
    const roles = await Promise.all(
      roleNames.map((name) => this.roleRepository.findByName(name)),
    );

    return roles.filter(Boolean).map((r) => r!.id!);
  }
}
