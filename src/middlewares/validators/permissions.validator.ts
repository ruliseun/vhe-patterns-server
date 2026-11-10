/* eslint-disable no-prototype-builtins */
import { check } from "express-validator";
import EnumUtils from "../../utils/enum.utils";
import { ProfileTypeEnum } from "../../enums/user-type.enum";
import { PermissionsEnum } from "../../enums/permissions.enum";

export const validateCreatePermission = [
  check("permissionName")
    .exists()
    .withMessage("Permission name is required")
    .notEmpty()
    .withMessage("Permission Name cannot be empty")
    .isString()
    .withMessage("Permission Name must be a string")
    .trim(),
  check("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isString()
    .withMessage("Description must be a string")
    .toUpperCase()
    .trim(),
];

export const validateUpdatePermission = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .toUpperCase()
    .trim(),
  check("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isString()
    .withMessage("Description must be a string")
    .toUpperCase()
    .trim(),
];

export const validateProfilePermissionConfig = [
  check("permission")
    .exists()
    .withMessage("permission is required")
    .notEmpty()
    .withMessage("permission cannot be empty")
    .isString()
    .withMessage("permission must be a string")
    .custom((value: string) => {
      const availablePermissions: string[] = EnumUtils.extractEnumValues(PermissionsEnum) as string[];
      if (!availablePermissions.includes(value)) {
        throw new Error("Invalid permission string");
      }
      return true;
    }),

  check("profileTypes")
    .exists()
    .withMessage("profileTypes is required")
    .notEmpty()
    .withMessage("profileTypes cannot be empty")
    .isArray()
    .withMessage("profileType must be an array")
    .custom((value: string[]) => {
      const availableProfiles: string[] = EnumUtils.extractEnumValues(ProfileTypeEnum) as string[];
      for (const val of value) {
        if (typeof val !== "string") throw new Error("Invalid value in profile array");
        if (!availableProfiles.includes(val)) {
          throw new Error("Profile type does not exist");
        }
        return true;
      }
    }),
];

export const assignUserPermissionValidator = [
  check("userId")
    .exists()
    .withMessage("User Id must be a number")
    .notEmpty()
    .withMessage("UserId cannot be empty")
    .isNumeric()
    .withMessage("UserId must be number"),

  check("permissions")
    .exists()
    .withMessage("permissions is required")
    .notEmpty()
    .withMessage("permissions cannot be empty")
    .isArray()
    .withMessage("permissions must be an array")
    .custom((value: any[]) => {
      if (!Array.isArray(value)) return false;
      for (const val of value) {
        if (typeof val !== "object" || val === null || !val.hasOwnProperty("permission")) {
          throw new Error(
            "Each item in permissions must be an object with a required 'permission' key and optional 'description' and 'expiredAt'",
          );
        }
      }
      return true;
    }),
];

export const unassignUserPermissionValidator = [
  check("userId")
    .exists()
    .withMessage("User Id must be a number")
    .notEmpty()
    .withMessage("UserId cannot be empty")
    .isNumeric()
    .withMessage("UserId must be number"),

  check("permissions")
    .exists()
    .withMessage("permissions is required")
    .notEmpty()
    .withMessage("permissions cannot be empty")
    .isArray()
    .withMessage("permissions must be an array")
    .custom((value: any[]) => {
      if (!Array.isArray(value)) return false;
      const availablePermissions: string[] = EnumUtils.extractEnumValues(PermissionsEnum) as string[];
      for (const val of value) {
        if (typeof val !== "string" || val === null) {
          throw new Error("Permissions value must be a string");
        }
        if (!availablePermissions.includes(val)) {
          throw new Error("Invalid permission string");
        }
      }
      return true;
    }),
];
