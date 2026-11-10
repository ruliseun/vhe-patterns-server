import { Role } from "../../entity/Role";
import { Permission } from "../../entity/Permission";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { ProfileTypeEnum } from "../../enums/user-type.enum";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { PERMISSION_MODEL, ROLE_MODEL, USER_PERMISSION_MODEL } from "../../config/database/db";
import { User } from "../../entity/User";
import { UserPermission } from "../../entity/UserPermissions";
import { IUser } from "../../interface/user.interface";
import { IRoleMatrix } from "../../interface/shared.interface";

async function getPermissionRoleMapping(): Promise<{ [permissionName: string]: string[] }> {
  const permissions = await ABSTRACT_SERVICE.getAllData(Permission, { relations: ["roles"] });

  const mapping: { [permissionName: string]: string[] } = {};

  permissions.forEach((permission) => {
    mapping[permission.name] = permission.roles?.map((role: { name: string }) => role.name) || [];
  });

  return mapping;
}

async function getRolePermissionMapping(): Promise<{ [roleName: string]: string[] }> {
  const roles = await ABSTRACT_SERVICE.getAllData(Role, { relations: ["permissions"] });

  const mapping: { [roleName: string]: string[] } = {};

  roles.forEach((role) => {
    mapping[role.name] = role.permissions?.map((permission: { name: string }) => permission.name) || [];
  });

  return mapping;
}

async function getPermissionMatrix(): Promise<IRoleMatrix> {
  const [permissions, roles] = await Promise.all([
    ABSTRACT_SERVICE.getAllData(Permission, { relations: ["roles"] }),
    ABSTRACT_SERVICE.getAllData(Role),
  ]);

  const permissionData = permissions.map((p) => ({ name: p.name, description: p.description }));
  const roleNames = roles.map((r) => r.name);
  const matrix: { [permissionName: string]: { description: string; roles: { [roleName: string]: boolean } } } = {};

  permissions.forEach((permission) => {
    matrix[permission.name] = {
      description: permission.description,
      roles: {},
    };

    roleNames.forEach((roleName) => {
      matrix[permission.name].roles[roleName] =
        permission.roles?.some((role: { name: string }) => role.name === roleName) || false;
    });
  });

  return {
    permissions: permissionData,
    roles: roleNames,
    matrix,
  };
}

async function getUnassignedPermissions(): Promise<string[]> {
  const permissions = await ABSTRACT_SERVICE.getAllData(Permission, { relations: ["roles"] });

  return permissions
    .filter((permission) => !permission.roles || permission.roles.length === 0)
    .map((permission) => permission.name);
}

async function getEmptyRoles(): Promise<string[]> {
  const roles = await ABSTRACT_SERVICE.getAllData(Role, { relations: ["permissions"] });

  return roles.filter((role) => !role.permissions || role.permissions.length === 0).map((role) => role.name);
}

async function getPermissionsByRole(roleName: string): Promise<string[]> {
  const role = await ABSTRACT_SERVICE.findAndPopulate(Role, { name: roleName }, ["permissions"]);
  return role?.permissions?.map((permission: { name: string }) => permission.name) || [];
}

async function getRolesByPermission(permissionName: string): Promise<string[]> {
  const permission = await ABSTRACT_SERVICE.findAndPopulate(Role, { name: permissionName }, ["roles"]);
  return permission?.roles?.map((role: { name: string }) => role.name) || [];
}

async function configureProfileTypePermissions(permissionName: string, profileTypes: ProfileTypeEnum[]) {
  const reqestProfileTypes = profileTypes.map((p) => p.toUpperCase());
  const permission = await ABSTRACT_SERVICE.findAndPopulate(Permission, { name: permissionName }, ["roles"]);

  if (!permission) {
    throw createError(`Permission '${permissionName}' not found`, ResponseCodeEnum.NOT_FOUND);
  }

  const rolesToAssign = await ROLE_MODEL.createQueryBuilder("role")
    .where("role.name IN (:...profileTypes)", { profileTypes: reqestProfileTypes })
    .getMany();

  const foundRoleNames = rolesToAssign.map((role) => role.name);
  const missingRoles = reqestProfileTypes.filter((pt) => !foundRoleNames.includes(pt));

  if (missingRoles.length) {
    throw createError(`Roles not found for profile types: ${missingRoles.join(", ")}`, ResponseCodeEnum.NOT_FOUND);
  }

  permission.roles = rolesToAssign;

  await PERMISSION_MODEL.save(permission);

  return {
    permission: permissionName,
    assignedRoles: permission.roles.map((r: { name: string }) => r.name),
    totalRoles: permission.roles.length,
  };
}

async function assignUserPermissions(
  userProfile: IUser,
  userId: number,
  permissions: Array<{
    permission: string;
    description?: string;
    expiresAt?: Date;
  }>,
) {
  const user = await ABSTRACT_SERVICE.findAndPopulate(User, { id: userId }, ["permissions"]);

  if (!user) {
    throw createError("User record not found", ResponseCodeEnum.NOT_FOUND);
  }

  if (user.activeOrganisationId !== userProfile.activeOrganisationId) {
    throw createError("You dont have permission to update this user profile", ResponseCodeEnum.FORBIDDEN);
  }

  const permissionNames = [...new Set(permissions.map((p) => p.permission))];

  const existingPermissions = await PERMISSION_MODEL.createQueryBuilder("permission")
    .where("permission.name IN (:...permissionNames)", { permissionNames })
    .getMany();

  const existingPermissionNames = existingPermissions.map((p) => p.name);
  const invalidPermissions = permissionNames.filter((name) => !existingPermissionNames.includes(name));

  if (invalidPermissions.length) {
    throw createError(`Permissions not found: ${invalidPermissions.join(", ")}`, ResponseCodeEnum.NOT_FOUND);
  }

  const assignedPermissions = [];

  for (const permissionData of permissions) {
    const existingUserPermission = await ABSTRACT_SERVICE.findByEntries(UserPermission, {
      userId,
      permission: permissionData.permission,
    } as any);

    if (existingUserPermission) {
      existingUserPermission.description = permissionData.description || existingUserPermission.description;
      existingUserPermission.expiresAt = permissionData.expiresAt || existingUserPermission.expiresAt;
      existingUserPermission.updatedAt = new Date();

      await USER_PERMISSION_MODEL.save(existingUserPermission);
      assignedPermissions.push({
        permission: permissionData.permission,
        action: "updated",
      });
    } else {
      await ABSTRACT_SERVICE.createData(UserPermission, {
        userId,
        permission: permissionData.permission,
        description: permissionData.description,
        expiresAt: permissionData.expiresAt,
      });

      assignedPermissions.push({
        permission: permissionData.permission,
        action: "created",
      });
    }
  }

  return { userId, assignedPermissions };
}

async function removeUserPermissions(userProfile: IUser, userId: number, permissions: string[]) {
  const user = await ABSTRACT_SERVICE.getUniqueData(User, { id: userId });

  if (!user) {
    throw createError("User record not found", ResponseCodeEnum.NOT_FOUND);
  }

  if (user.activeOrganisationId !== userProfile.activeOrganisationId) {
    throw createError("You dont have permission to update this user profile", ResponseCodeEnum.FORBIDDEN);
  }

  const existingPermissions = await PERMISSION_MODEL.createQueryBuilder("permission")
    .where("permission.name IN (:...permissions)", { permissions })
    .getMany();

  const existingPermissionNames = existingPermissions.map((p) => p.name);
  const invalidPermissions = permissions.filter((name) => !existingPermissionNames.includes(name));

  if (invalidPermissions.length) {
    throw createError(`Permissions not found: ${invalidPermissions.join(", ")}`, ResponseCodeEnum.NOT_FOUND);
  }

  const removedPermissions = [];
  const notFoundPermissions = [];

  for (const permissionName of permissions) {
    const userPermission = await ABSTRACT_SERVICE.findByEntries(UserPermission, {
      userId,
      permission: permissionName,
    } as any);

    if (userPermission) {
      await ABSTRACT_SERVICE.removeData(UserPermission, { userId, permission: permissionName });
      removedPermissions.push(permissionName);
    } else {
      notFoundPermissions.push(permissionName);
    }
  }

  return {
    userId,
    removedPermissions,
    notFoundPermissions: notFoundPermissions.length > 0 ? notFoundPermissions : undefined,
  };
}

const PermissionMapperService = {
  getPermissionRoleMapping,
  getRolePermissionMapping,
  getPermissionMatrix,
  getUnassignedPermissions,
  getEmptyRoles,
  getPermissionsByRole,
  getRolesByPermission,
  configureProfileTypePermissions,
  assignUserPermissions,
  removeUserPermissions,
};

export default PermissionMapperService;
