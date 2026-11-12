import { check } from "express-validator";
import { PromoBarStatusEnum } from "../../enums/promo-bar.enum";

const STATUSES = Object.values(PromoBarStatusEnum);

export const validateUpdatePromoBar = [
  check("status")
    .optional()
    .isIn(STATUSES)
    .withMessage(`status must be one of: ${STATUSES.join(", ")}`),
  check("message")
    .optional({ nullable: true })
    .isString()
    .withMessage("message must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("message cannot exceed 500 characters"),
];
