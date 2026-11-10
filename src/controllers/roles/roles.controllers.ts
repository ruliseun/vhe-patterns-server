import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ICreateRole } from "../../interface/shared.interface";
import RolesService from "../../service/roles/roles.service";

const createRole = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateRole;
  try {
    const role = await RolesService.createRole(data);

    return res.status(200).json({
      status: 200,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    Logger.error("Error creating Role:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error creating role", data: null });
  }
};

const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await RolesService.getRoles();

    return res.status(200).json({
      status: 200,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (error) {
    Logger.error("Error fetching Role:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error fetching role", data: null });
  }
};

const updateRole = async (req: Request, res: Response) => {
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

    await RolesService.updateRole(id, data);

    return res.status(200).json({
      status: 200,
      message: "Role updated successfully",
      data,
    });
  } catch (error) {
    Logger.error("Error updating Role:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error updating role", data: null });
  }
};

const deletedRole = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    return await RolesService.deleteRole(id);
  } catch (error) {
    Logger.error("Error deleting Role:::", error);
    res
      .status(error.httpStatusCode || 500)
      .json({ status: error.httpStatusCode, message: error.message || "Error deleting role", data: null });
  }
};

const RolesController = { createRole, getRoles, updateRole, deletedRole };

export default RolesController;
