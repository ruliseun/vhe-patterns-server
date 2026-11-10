import { check } from "express-validator";

export const validateCreateCategory = [
  check("name")
    .exists()
    .withMessage("Name is required")
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
];

export const validateUpdateCategory = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().trim(),
  check("description").optional().isString().withMessage("Description must be a string").trim(),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
];
