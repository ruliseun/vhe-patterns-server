import { Permission } from "../../entity/Permission";
import { ICreatePermission } from "../../interface/shared.interface";
import ABSTRACT_SERVICE from "../abstractService/abstractService";

async function createPermission(data: ICreatePermission) {
  const { permissionName, description } = data;

  const permissionExist = await ABSTRACT_SERVICE.getUniqueData(Permission, { name: permissionName });

  if (permissionExist) {
    const error = new Error("Permission already exist");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const createPermission = await ABSTRACT_SERVICE.createData(Permission, {
    name: permissionName,
    description: description,
  });

  if (!createPermission) {
    const error = new Error("Error creating permission");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  return createPermission;
}

async function getPermissions() {
  return await ABSTRACT_SERVICE.getAllData(Permission);
}

async function updatePermission(id: number, data: { [key: string]: string }) {
  return await ABSTRACT_SERVICE.updateById(Permission, id, data);
}

async function deletePermission(id: number) {
  return await ABSTRACT_SERVICE.removeData(Permission, { id });
}

const PermissionService = { createPermission, getPermissions, updatePermission, deletePermission };

export default PermissionService;
