import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import UploadHandler from "../helpers/cloudinary-upload/upload.handlers";
import BrandsController from "../controllers/brand/brand.controller";
import {
  getBrandsValidator,
  validateCreateBrand,
  validateUpdateBrand,
} from "../middlewares/validators/brand.validator";
import { validateCustomRequest, validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/",
  validateKey,
  UploadHandler.brandFilesUploadHandler,
  validateCreateBrand,
  validate,
  BrandsController.createBrand,
);

router.get("/", validateKey, getBrandsValidator, validate, BrandsController.getBrands);

router.get("/:identifier", validateKey, validateCustomRequest(["identifier"]), validate, BrandsController.getBrand);

router.patch(
  "/:id",
  validateKey,
  UploadHandler.brandFilesUploadHandler,
  validateRequiredId("id"),
  validateUpdateBrand,
  validate,
  BrandsController.updateBrand,
);

router.delete("/:id", validateKey, validateRequiredId("id"), validate, BrandsController.deleteBrand);

export default router;
