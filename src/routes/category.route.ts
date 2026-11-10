import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import CategoriesController from "../controllers/category/category.controller";
import { validateCreateCategory, validateUpdateCategory } from "../middlewares/validators/category.validator";
import { validateCustomRequest, validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post("/", validateKey, validateCreateCategory, validate, CategoriesController.createCategory);

router.get("/", validateKey, CategoriesController.getCategories);

router.get(
  "/:identifier",
  validateKey,
  validateCustomRequest(["identifier"]),
  validate,
  CategoriesController.getCategory,
);

router.patch(
  "/:id",
  validateKey,
  validateRequiredId("id"),
  validateUpdateCategory,
  validate,
  CategoriesController.updateCategory,
);

router.delete(
  "/:id",
  validateKey,
  validateRequiredId("id"),
  validate,
  CategoriesController.deleteCategory,
);

export default router;
