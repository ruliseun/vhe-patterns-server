import { Permission } from "../../entity/Permission";
import { Role } from "../../entity/Role";
import { ICreateRole } from "../../interface/shared.interface";
import ABSTRACT_SERVICE from "../abstractService/abstractService";

async function createRole(data: ICreateRole) {
  const { roleName, permissions = [] } = data;
  let payload = {};

  const roleExist = await ABSTRACT_SERVICE.getUniqueData(Role, { name: roleName });

  if (roleExist) {
    const error = new Error("Role already added");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const permissionIds = await ABSTRACT_SERVICE.findMultipleIds(Permission, permissions);

  if (permissionIds.length) {
    payload = { name: roleName, permissions: permissionIds };
  } else {
    payload = { name: roleName };
  }

  const newRole = await ABSTRACT_SERVICE.createData(Role, payload);

  return newRole;
}

async function getRoles() {
  return await ABSTRACT_SERVICE.getAllData(Role);
}

async function updateRole(id: number, data: { [key: string]: string }) {
  return await ABSTRACT_SERVICE.updateById(Role, id, data);
}

async function deleteRole(id: number) {
  return await ABSTRACT_SERVICE.removeData(Role, { id });
}

const RolesService = { createRole, getRoles, updateRole, deleteRole };

export default RolesService;
