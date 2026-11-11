import { check, query } from "express-validator";
import { BrandStatusEnum } from "../../enums/brand.enum";

export const validateCreateBrand = [
  check("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  check("excerpt").optional().isString().withMessage("Excerpt must be a string").trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("status")
    .optional()
    .isIn(Object.values(BrandStatusEnum))
    .withMessage(`Status must be one of: ${Object.values(BrandStatusEnum).join(", ")}`),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("mainImage").optional().isString().withMessage("Main image must be a string").trim(),
  check("gallery").optional(),
];

export const validateUpdateBrand = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().trim(),
  check("excerpt").optional().isString().withMessage("Excerpt must be a string").trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("status")
    .optional()
    .isIn(Object.values(BrandStatusEnum))
    .withMessage(`Status must be one of: ${Object.values(BrandStatusEnum).join(", ")}`),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("mainImage").optional().isString().withMessage("Main image must be a string").trim(),
  check("gallery").optional(),
];

export const getBrandsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("status")
    .optional()
    .isIn([...Object.values(BrandStatusEnum), "all"])
    .withMessage(`Status must be one of: ${Object.values(BrandStatusEnum).join(", ")}, all`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
