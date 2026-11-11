import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import ContactRequestsController from "../controllers/contact/contact.controller";
import {
  getContactRequestsValidator,
  validateContactReply,
  validateCreateContactRequest,
} from "../middlewares/validators/contact.validator";
import { validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post("/", validateKey, validateCreateContactRequest, validate, ContactRequestsController.createContactRequest);

router.get("/", validateKey, getContactRequestsValidator, validate, ContactRequestsController.getContactRequests);

router.get("/:id", validateKey, validateRequiredId("id"), validate, ContactRequestsController.getContactRequest);

router.post(
  "/:id/reply",
  validateKey,
  validateRequiredId("id"),
  validateContactReply,
  validate,
  ContactRequestsController.replyToContactRequest,
);

router.delete("/:id", validateKey, validateRequiredId("id"), validate, ContactRequestsController.deleteContactRequest);

export default router;
