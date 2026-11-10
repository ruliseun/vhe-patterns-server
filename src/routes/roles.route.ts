import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import { validateCreateRole, validateUpdateRole } from "../middlewares/validators/roles.validator";
import RolesController from "../controllers/roles/roles.controllers";
import { validateCustomRequest } from "../middlewares/validators/validator";
import { authGuard } from "../middlewares/auth.guard";
import { ProfileTypeEnum } from "../enums/user-type.enum";
import { permissionsGuard } from "../middlewares/permissions.guard";
import { logAuditTrails } from "../audit/audit.trail";
import { PermissionsEnum } from "../enums/permissions.enum";

const router = Router();

router.post("/new", logAuditTrails, validateKey, validateCreateRole, validate, RolesController.createRole);

router.get(
  "/",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  RolesController.getRoles,
);

router.patch(
  "/:id",
  logAuditTrails,
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard(
    [PermissionsEnum.Can_Delete_Permissions, PermissionsEnum.Can_Delete_Permissions],
    true,
  ),
  validateCustomRequest(["id"]),
  validateUpdateRole,
  validate,
  RolesController.updateRole,
);

router.delete(
  "/",
  logAuditTrails,
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  validateCustomRequest(["id"]),
  validate,
  RolesController.deletedRole,
);

export default router;
