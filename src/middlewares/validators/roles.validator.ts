import { check } from "express-validator";

export const validateCreateRole = [
  check("roleName")
    .exists()
    .withMessage("Role name is required")
    .notEmpty()
    .withMessage("Role Name cannot be empty")
    .isString()
    .withMessage("Role Name must be a string")
    .toUpperCase()
    .trim(),
  check("permissions")
    .exists()
    .withMessage("Permissions is required")
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((value) => {
      for (const val of value) {
        if (val && typeof val !== "number") throw new Error("values must be a number");
      }
      return true;
    }),
];

export const validateUpdateRole = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Role Name cannot be empty")
    .isString()
    .withMessage("Role Name must be a string")
    .toUpperCase()
    .trim(),
  check("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((value, { req }) => {
      if (value && !req.body.name) throw Error("You must provide a name to update the role");
      for (const val of value) {
        if (val && typeof val !== "number") throw new Error("values must be a number");
      }
      return true;
    }),
];
