import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import UploadHandler from "../helpers/cloudinary-upload/upload.handlers";
import CustomPrintRequestsController from "../controllers/custom-print/custom-print.controller";
import {
  getCustomPrintRequestsValidator,
  validateCreateCustomPrintRequest,
  validateUpdateCustomPrintStatus,
} from "../middlewares/validators/custom-print.validator";
import { validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/",
  validateKey,
  UploadHandler.customPrintImagesUploadHandler,
  validateCreateCustomPrintRequest,
  validate,
  CustomPrintRequestsController.createCustomPrintRequest,
);

router.get(
  "/",
  validateKey,
  getCustomPrintRequestsValidator,
  validate,
  CustomPrintRequestsController.getCustomPrintRequests,
);

router.get(
  "/:id",
  validateKey,
  validateRequiredId("id"),
  validate,
  CustomPrintRequestsController.getCustomPrintRequest,
);

router.patch(
  "/:id/status",
  validateKey,
  validateRequiredId("id"),
  validateUpdateCustomPrintStatus,
  validate,
  CustomPrintRequestsController.updateCustomPrintStatus,
);

router.delete(
  "/:id",
  validateKey,
  validateRequiredId("id"),
  validate,
  CustomPrintRequestsController.deleteCustomPrintRequest,
);

export default router;
