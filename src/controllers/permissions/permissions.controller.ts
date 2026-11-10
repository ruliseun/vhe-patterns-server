import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import PermissionService from "../../service/permissions/permission.service";
import { ICreatePermission } from "../../interface/shared.interface";

const createPermission = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreatePermission;
  try {
    const permission = await PermissionService.createPermission(data);

    return res.status(200).json({
      status: 200,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    Logger.error("Error creating Permission:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error creating permission", data: null });
  }
};

const getPermissions = async (_req: Request, res: Response) => {
  try {
    const roles = await PermissionService.getPermissions();

    return res.status(200).json({
      status: 200,
      message: "Permissions retrieved successfully",
      data: roles,
    });
  } catch (error) {
    Logger.error("Error fetching permission:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error fetching permissions", data: null });
  }
};

const updatePermission = async (req: Request, res: Response) => {
  const { id, ...data } = matchedData(req);

  try {
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ status: "failed", message: "No data to update", data: null });
    }

    const updates = {} as { [key: string]: string | number };

    for (const key in data) {
      if (data[key]) {
        updates[key] = data[key];
      }
    }

    await PermissionService.updatePermission(id, data);

    return res.status(200).json({
      status: 200,
      message: "Permission updated successfully",
      data,
    });
  } catch (error) {
    Logger.error("Error updating Permission:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error updating permission", data: null });
  }
};

const deletedPermission = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    return await PermissionService.deletePermission(id);
  } catch (error) {
    Logger.error("Error deleting permission:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error deleting permission", data: null });
  }
};

const PermissionController = { createPermission, updatePermission, deletedPermission, getPermissions };

export default PermissionController;
