import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import UploadHandler from "../helpers/cloudinary-upload/upload.handlers";
import DesignsController from "../controllers/design/design.controller";
import {
  getDesignsValidator,
  validateCreateDesign,
  validateUpdateDesign,
} from "../middlewares/validators/design.validator";
import { validateCustomRequest, validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/",
  validateKey,
  UploadHandler.designFilesUploadHandler,
  validateCreateDesign,
  validate,
  DesignsController.createDesign,
);

router.get("/", validateKey, getDesignsValidator, validate, DesignsController.getDesigns);

router.get("/:identifier", validateKey, validateCustomRequest(["identifier"]), validate, DesignsController.getDesign);

router.patch(
  "/:id",
  validateKey,
  UploadHandler.designFilesUploadHandler,
  validateRequiredId("id"),
  validateUpdateDesign,
  validate,
  DesignsController.updateDesign,
);

router.delete(
  "/:id",
  validateKey,
  validateRequiredId("id"),
  validate,
  DesignsController.deleteDesign,
);

export default router;
