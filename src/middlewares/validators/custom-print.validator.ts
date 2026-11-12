import { check, query } from "express-validator";
import { CustomPrintStatusEnum } from "../../enums/custom-print.enum";

const requiredString = (field: string, label: string) =>
  check(field)
    .exists()
    .withMessage(`${label} is required`)
    .notEmpty()
    .withMessage(`${label} cannot be empty`)
    .isString()
    .withMessage(`${label} must be a string`)
    .trim();

const optionalString = (field: string, label: string) =>
  check(field).optional().isString().withMessage(`${label} must be a string`).trim();

export const validateCreateCustomPrintRequest = [
  requiredString("firstName", "First name"),
  requiredString("lastName", "Last name"),
  optionalString("brand", "Brand"),
  check("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail()
    .trim(),
  requiredString("phone", "Phone number"),
  optionalString("altPhone", "Alternative phone number"),
  requiredString("service", "Service"),
  check("quantity")
    .exists()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a whole number of at least 1")
    .toInt(),
  requiredString("description", "Description"),
  optionalString("references", "References"),
  requiredString("timeline", "Timeline"),
  optionalString("fabric", "Fabric"),
  optionalString("budget", "Budget"),
  optionalString("message", "Message"),
];

export const validateUpdateCustomPrintStatus = [
  check("status")
    .exists()
    .withMessage("Status is required")
    .isIn(Object.values(CustomPrintStatusEnum))
    .withMessage(`Status must be one of: ${Object.values(CustomPrintStatusEnum).join(", ")}`),
  check("notifyCustomer").optional().isBoolean().withMessage("notifyCustomer must be a boolean").toBoolean(),
  optionalString("note", "Note"),
];

export const getCustomPrintRequestsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("status")
    .optional()
    .isIn([...Object.values(CustomPrintStatusEnum), "all"])
    .withMessage(`Status must be one of: ${Object.values(CustomPrintStatusEnum).join(", ")}, all`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
