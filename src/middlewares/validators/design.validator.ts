import { check, query } from "express-validator";
import { DesignFlagEnum, DesignSortEnum, DesignStatusEnum } from "../../enums/design.enum";

export const validateCreateDesign = [
  check("title")
    .exists()
    .withMessage("Title is required")
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isString()
    .withMessage("Title must be a string")
    .trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("exclusivePrice")
    .exists()
    .withMessage("Exclusive price is required")
    .isNumeric()
    .withMessage("Exclusive price must be a number")
    .toInt(),
  check("nonExclusivePrice")
    .exists()
    .withMessage("Non-exclusive price is required")
    .isNumeric()
    .withMessage("Non-exclusive price must be a number")
    .toInt(),
  check("categoryId")
    .exists()
    .withMessage("Category is required")
    .isNumeric()
    .withMessage("Category must be a number")
    .toInt(),
  check("status")
    .optional()
    .isIn(Object.values(DesignStatusEnum))
    .withMessage(`Status must be one of: ${Object.values(DesignStatusEnum).join(", ")}`),
  check("flag")
    .optional()
    .isIn(Object.values(DesignFlagEnum))
    .withMessage(`Flag must be one of: ${Object.values(DesignFlagEnum).join(", ")}`),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("mainImage").optional().isString().withMessage("Main image must be a string").trim(),
  check("colorVariations").optional(),
];

export const validateUpdateDesign = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty").isString().trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("exclusivePrice").optional().isNumeric().withMessage("Exclusive price must be a number").toInt(),
  check("nonExclusivePrice").optional().isNumeric().withMessage("Non-exclusive price must be a number").toInt(),
  check("categoryId").optional().isNumeric().withMessage("Category must be a number").toInt(),
  check("status")
    .optional()
    .isIn(Object.values(DesignStatusEnum))
    .withMessage(`Status must be one of: ${Object.values(DesignStatusEnum).join(", ")}`),
  check("flag")
    .optional()
    .isIn(Object.values(DesignFlagEnum))
    .withMessage(`Flag must be one of: ${Object.values(DesignFlagEnum).join(", ")}`),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("mainImage").optional().isString().withMessage("Main image must be a string").trim(),
  check("colorVariations").optional(),
];

export const getDesignsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("sort")
    .optional()
    .isIn(Object.values(DesignSortEnum))
    .withMessage(`Sort must be one of: ${Object.values(DesignSortEnum).join(", ")}`),
  query("categoryId").optional().isNumeric().withMessage("Category must be a number"),
  query("status")
    .optional()
    .isIn([...Object.values(DesignStatusEnum), "all"])
    .withMessage(`Status must be one of: ${Object.values(DesignStatusEnum).join(", ")}, all`),
  query("flag")
    .optional()
    .isIn(Object.values(DesignFlagEnum))
    .withMessage(`Flag must be one of: ${Object.values(DesignFlagEnum).join(", ")}`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
