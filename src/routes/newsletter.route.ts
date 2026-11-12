import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import NewsletterController from "../controllers/newsletter/newsletter.controller";
import {
  getSubscribersValidator,
  validateNewsletterBroadcast,
  validateSubscribeNewsletter,
  validateSubscriberStatus,
} from "../middlewares/validators/newsletter.validator";
import { validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

// Public: opened from the link in newsletter emails, so no API key.
router.get("/unsubscribe", NewsletterController.unsubscribePage);
router.post("/unsubscribe", NewsletterController.unsubscribeOneClick);

router.post("/", validateKey, validateSubscribeNewsletter, validate, NewsletterController.subscribe);

router.get("/", validateKey, getSubscribersValidator, validate, NewsletterController.getSubscribers);

router.post("/broadcast", validateKey, validateNewsletterBroadcast, validate, NewsletterController.sendBroadcast);

router.patch(
  "/:id/status",
  validateKey,
  validateRequiredId("id"),
  validateSubscriberStatus,
  validate,
  NewsletterController.updateSubscriberStatus,
);

export default router;
