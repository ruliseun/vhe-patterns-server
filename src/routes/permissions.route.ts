import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import PermissionController from "../controllers/permissions/permissions.controller";
import {
  assignUserPermissionValidator,
  unassignUserPermissionValidator,
  validateCreatePermission,
  validateProfilePermissionConfig,
  validateUpdatePermission,
} from "../middlewares/validators/permissions.validator";
import { authGuard } from "../middlewares/auth.guard";
import { ProfileTypeEnum } from "../enums/user-type.enum";
import { permissionsGuard } from "../middlewares/permissions.guard";
import { validateCustomRequest, validateOptionalField } from "../middlewares/validators/validator";
import { logAuditTrails } from "../audit/audit.trail";
import { PermissionsEnum } from "../enums/permissions.enum";
import PermissionMapperController from "../controllers/permissions/permissionMapper.controller";

const router = Router();

router.post(
  "/new",
  logAuditTrails,
  validateKey,
  validateCreatePermission,
  validate,
  PermissionController.createPermission,
);

router.get(
  "/",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  PermissionController.getPermissions,
);

router.patch(
  "/:id",
  logAuditTrails,
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  validateCustomRequest(["id"]),
  validateUpdatePermission,
  validate,
  PermissionController.updatePermission,
);

router.delete(
  "/",
  logAuditTrails,
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  validateCustomRequest(["id"]),
  validate,
  PermissionController.deletedPermission,
);

router.get(
  "/permission_roles",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  validateOptionalField("permissionName"),
  validate,
  PermissionMapperController.getPermissionsRoles,
);

router.get(
  "/role_permissions",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  validateOptionalField("roleName"),
  validate,
  PermissionMapperController.getRolePermissions,
);

router.get(
  "/matrix",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  PermissionMapperController.getPermissionsMatrix,
);

router.get(
  "/unassigned_permissions",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  PermissionMapperController.getUnassignedPermissions,
);

router.get(
  "/unassigned_roles",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  PermissionMapperController.getEmptyRoles,
);

router.post(
  "/update_profile_permissions",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard(
    [PermissionsEnum.Can_Delete_Permissions, PermissionsEnum.Can_Delete_Permissions],
    true,
  ),
  validateProfilePermissionConfig,
  validate,
  PermissionMapperController.updateProfilePermission,
);

router.post(
  "/set_user_permission",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard(
    [PermissionsEnum.Can_Delete_Permissions, PermissionsEnum.Can_Delete_Permissions],
    true,
  ),
  assignUserPermissionValidator,
  validate,
  PermissionMapperController.assignUsersPermission,
);

router.post(
  "/unset_user_permission",
  validateKey,
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard(
    [PermissionsEnum.Can_Delete_Permissions, PermissionsEnum.Can_Delete_Permissions],
    true,
  ),
  unassignUserPermissionValidator,
  validate,
  PermissionMapperController.removeUserPermissions,
);

export default router;
