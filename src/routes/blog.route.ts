import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import UploadHandler from "../helpers/cloudinary-upload/upload.handlers";
import BlogController from "../controllers/blog/blog.controller";
import {
  getBlogPostsValidator,
  validateCreateBlogPost,
  validateUpdateBlogPost,
} from "../middlewares/validators/blog.validator";
import { validateCustomRequest, validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/",
  validateKey,
  UploadHandler.blogFilesUploadHandler,
  validateCreateBlogPost,
  validate,
  BlogController.createBlogPost,
);

// Images embedded in the markdown body.
router.post("/images", validateKey, UploadHandler.blogImageUploadHandler, BlogController.uploadContentImage);

router.get("/", validateKey, getBlogPostsValidator, validate, BlogController.getBlogPosts);

router.get("/:identifier", validateKey, validateCustomRequest(["identifier"]), validate, BlogController.getBlogPost);

router.patch(
  "/:id",
  validateKey,
  UploadHandler.blogFilesUploadHandler,
  validateRequiredId("id"),
  validateUpdateBlogPost,
  validate,
  BlogController.updateBlogPost,
);

router.delete("/:id", validateKey, validateRequiredId("id"), validate, BlogController.deleteBlogPost);

export default router;
