import { check, query } from "express-validator";
import { BlogStatusEnum } from "../../enums/blog.enum";

const STATUSES = Object.values(BlogStatusEnum);

export const validateCreateBlogPost = [
  check("title")
    .exists()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  check("content")
    .exists()
    .withMessage("Content is required")
    .isString()
    .withMessage("Content must be a string")
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
  check("excerpt").optional().isString().withMessage("Excerpt must be a string").trim(),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("status")
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
];

export const validateUpdateBlogPost = [
  check("title").optional().isString().withMessage("Title must be a string").trim().notEmpty(),
  check("content").optional().isString().withMessage("Content must be a string").trim().notEmpty(),
  check("excerpt").optional().isString().withMessage("Excerpt must be a string").trim(),
  check("slug").optional().isString().withMessage("Slug must be a string").trim(),
  check("status")
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
];

export const getBlogPostsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("status")
    .optional()
    .isIn([...STATUSES, "all"])
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}, all`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
