import { check, header } from "express-validator";
import { CartLicenseEnum } from "../../enums/cart.enum";

const LICENSES = Object.values(CartLicenseEnum);

export const validateGuestSession = [
  header("x-guest-session")
    .exists({ checkFalsy: true })
    .withMessage("x-guest-session header is required")
    .isUUID()
    .withMessage("x-guest-session must be a valid UUID")
    .trim(),
];

export const validateAddCartItem = [
  check("designId").exists().withMessage("designId is required").isInt({ min: 1 }).withMessage("designId must be a positive integer").toInt(),
  check("license")
    .exists()
    .withMessage("license is required")
    .isIn(LICENSES)
    .withMessage(`license must be one of: ${LICENSES.join(", ")}`),
  check("colorChanges")
    .exists()
    .withMessage("colorChanges is required")
    .isInt({ min: 0, max: 5 })
    .withMessage("colorChanges must be an integer between 0 and 5")
    .toInt(),
];

export const validateCartSelection = [
  check("selected")
    .exists()
    .withMessage("selected is required")
    .isBoolean()
    .withMessage("selected must be a boolean")
    .toBoolean(),
];
