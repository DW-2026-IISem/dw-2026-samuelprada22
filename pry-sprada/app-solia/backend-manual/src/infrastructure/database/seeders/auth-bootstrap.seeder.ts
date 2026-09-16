import * as bcrypt from 'bcrypt';

import { Status } from '../../../common/enums/status.enum.js';
import { HttpMethod } from '../../../common/enums/http-method.enum.js';

import { UserModel } from '../../../features/auth/users/infrastructure/persistence/models/user.model.js';
import { RoleModel } from '../../../features/auth/roles/infrastructure/persistence/models/role.model.js';
import { RoleUserModel } from '../../../features/auth/role-users/infrastructure/persistence/models/role-user.model.js';
import { ResourceModel } from '../../../features/auth/resources/infrastructure/persistence/models/resource.model.js';
import { ResourceRoleModel } from '../../../features/auth/resource-roles/infrastructure/persistence/models/resource-role.model.js';

export async function seedAuthBootstrap(): Promise<void> {
  // Roles
  if ((await RoleModel.count()) === 0) {
    await RoleModel.bulkCreate([
      {
        name: 'ADMIN',
        isActive: true,
        status: Status.ACTIVE,
      },
      {
        name: 'MANAGER',
        isActive: true,
        status: Status.ACTIVE,
      },
      {
        name: 'VENDEDOR',
        isActive: true,
        status: Status.ACTIVE,
      },
    ]);
  }

  // Users
  if ((await UserModel.count()) === 0) {
    const adminPassword = await bcrypt.hash('Admin123*', 10);
    const vendorPassword = await bcrypt.hash('Vendedor123*', 10);

    await UserModel.bulkCreate([
      {
        username: 'admin',
        email: 'admin@tecnogua.com',
        password: adminPassword,
        isActive: Status.ACTIVE,
      },
      {
        username: 'vendedor',
        email: 'vendedor@tecnogua.com',
        password: vendorPassword,
        isActive: Status.ACTIVE,
      },
    ]);
  }

  // Role-Users
  if ((await RoleUserModel.count()) === 0) {
    const admin = await UserModel.findOne({
      where: { email: 'admin@tecnogua.com' },
    });

    const vendor = await UserModel.findOne({
      where: { email: 'vendedor@tecnogua.com' },
    });

    const adminRole = await RoleModel.findOne({
      where: { name: 'ADMIN' },
    });

    const vendorRole = await RoleModel.findOne({
      where: { name: 'VENDEDOR' },
    });

    if (admin && adminRole) {
      await RoleUserModel.create({
        userId: admin.id,
        roleId: adminRole.id,
        isActive: true,
        status: Status.ACTIVE,
      });
    }

    if (vendor && vendorRole) {
      await RoleUserModel.create({
        userId: vendor.id,
        roleId: vendorRole.id,
        isActive: true,
        status: Status.ACTIVE,
      });
    }
  }

  // Resources
  if ((await ResourceModel.count()) === 0) {
    const resources = [
      { path: '/api/users', method: HttpMethod.GET },
      { path: '/api/users', method: HttpMethod.POST },
      { path: '/api/clients', method: HttpMethod.GET },
      { path: '/api/clients', method: HttpMethod.POST },
      { path: '/api/product-types', method: HttpMethod.GET },
      { path: '/api/product-types', method: HttpMethod.POST },
      { path: '/api/products', method: HttpMethod.GET },
      { path: '/api/products', method: HttpMethod.POST },
      { path: '/api/sales', method: HttpMethod.GET },
      { path: '/api/sales', method: HttpMethod.POST },
      { path: '/api/roles', method: HttpMethod.GET },
      { path: '/api/resources', method: HttpMethod.GET },
      { path: '/api/auth/login', method: HttpMethod.POST },
      { path: '/api/auth/refresh', method: HttpMethod.POST },
    ];

    await ResourceModel.bulkCreate(
      resources.map((resource) => ({
        ...resource,
        isActive: true,
        status: Status.ACTIVE,
      })),
    );
  }

  // Resource-Roles
  if ((await ResourceRoleModel.count()) === 0) {
    const adminRole = await RoleModel.findOne({
      where: { name: 'ADMIN' },
    });

    const vendorRole = await RoleModel.findOne({
      where: { name: 'VENDEDOR' },
    });

    const allResources = await ResourceModel.findAll();

    if (adminRole) {
      await ResourceRoleModel.bulkCreate(
        allResources.map((resource) => ({
          resourceId: resource.id,
          roleId: adminRole.id,
          isActive: true,
          status: Status.ACTIVE,
        })),
      );
    }

    if (vendorRole) {
      const vendorPaths = [
        '/api/clients',
        '/api/products',
        '/api/sales',
      ];

      const vendorResources = allResources.filter(
        (resource) =>
          vendorPaths.includes(resource.path) &&
          (resource.method === HttpMethod.GET ||
            resource.method === HttpMethod.POST),
      );

      await ResourceRoleModel.bulkCreate(
        vendorResources.map((resource) => ({
          resourceId: resource.id,
          roleId: vendorRole.id,
          isActive: true,
          status: Status.ACTIVE,
        })),
      );
    }
  }
}
