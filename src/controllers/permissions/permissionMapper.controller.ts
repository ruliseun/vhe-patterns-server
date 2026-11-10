import { Request, Response } from "express";
import PermissionMapperService from "../../service/permissions/permissionMapper.service";
import Logger from "../../utils/logger";
import { matchedData } from "express-validator";
import { IUser } from "../../interface/user.interface";

const getPermissionsRoles = async (req: Request, res: Response) => {
  const { permissionName } = matchedData(req);
  try {
    let permissionRoles;
    if (permissionName) {
      permissionRoles = await PermissionMapperService.getRolesByPermission(permissionName);
    } else {
      permissionRoles = await PermissionMapperService.getPermissionRoleMapping();
    }

    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: permissionRoles,
    });
  } catch (error) {
    Logger.error("Error fetching permission-role mapping:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error fetching permission-role mapping",
      data: null,
    });
  }
};

const getRolePermissions = async (req: Request, res: Response) => {
  const { roleName } = matchedData(req);
  try {
    let rolePermissions;
    if (roleName) {
      rolePermissions = await PermissionMapperService.getPermissionsByRole(roleName);
    } else {
      rolePermissions = await PermissionMapperService.getRolePermissionMapping();
    }

    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error fetching role-permission mapping:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error fetching role-permission mapping",
      data: null,
    });
  }
};

const getPermissionsMatrix = async (_req: Request, res: Response) => {
  try {
    const rolePermissions = await PermissionMapperService.getPermissionMatrix();

    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error fetching permission matrix:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error fetching permission matrix",
      data: null,
    });
  }
};

const getUnassignedPermissions = async (_req: Request, res: Response) => {
  try {
    const rolePermissions = await PermissionMapperService.getUnassignedPermissions();

    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error fetching record:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error fetching record",
      data: null,
    });
  }
};

const getEmptyRoles = async (_req: Request, res: Response) => {
  try {
    const rolePermissions = await PermissionMapperService.getEmptyRoles();

    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error fetching record:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error fetching record",
      data: null,
    });
  }
};

const updateProfilePermission = async (req: Request, res: Response) => {
  const { permission, profileTypes } = matchedData(req);
  try {
    const rolePermissions = await PermissionMapperService.configureProfileTypePermissions(permission, profileTypes);
    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error updating profile permission:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error updating profile permission",
      data: null,
    });
  }
};

const assignUsersPermission = async (req: Request, res: Response) => {
  const { userId, permissions } = matchedData(req);
  const userProfile = (req as any).profile as IUser;
  try {
    const rolePermissions = await PermissionMapperService.assignUserPermissions(userProfile, userId, permissions);
    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error updating user permission:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error updating user permission",
      data: null,
    });
  }
};

const removeUserPermissions = async (req: Request, res: Response) => {
  const { userId, permissions } = matchedData(req);
  const userProfile = (req as any).profile as IUser;
  try {
    const rolePermissions = await PermissionMapperService.removeUserPermissions(userProfile, userId, permissions);
    return res.status(200).json({
      status: 200,
      message: "Request processed successfully",
      data: rolePermissions,
    });
  } catch (error) {
    Logger.error("Error updating user permission:::", error);
    return res.status(error.httpStatusCode || 500).json({
      status: error.httpStatusCode,
      message: error.message || "Error updating user permission",
      data: null,
    });
  }
};

const PermissionMapperController = {
  getPermissionsRoles,
  getRolePermissions,
  getPermissionsMatrix,
  getUnassignedPermissions,
  getEmptyRoles,
  updateProfilePermission,
  assignUsersPermission,
  removeUserPermissions,
};

export default PermissionMapperController;
