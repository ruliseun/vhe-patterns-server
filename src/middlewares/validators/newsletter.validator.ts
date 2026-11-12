import { check, query } from "express-validator";
import { NewsletterStatusEnum } from "../../enums/newsletter.enum";

const STATUSES = Object.values(NewsletterStatusEnum);

export const validateSubscribeNewsletter = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .isEmail()
    .withMessage("Email must be a valid email address")
    .toLowerCase(),
];

export const validateSubscriberStatus = [
  check("status")
    .exists()
    .withMessage("Status is required")
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),
];

export const validateNewsletterBroadcast = [
  check("subject")
    .exists()
    .withMessage("Subject is required")
    .isString()
    .withMessage("Subject must be a string")
    .trim()
    .notEmpty()
    .withMessage("Subject cannot be empty"),
  check("message")
    .exists()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty"),
  check("subscriberIds").optional().isArray().withMessage("Subscriber IDs must be an array"),
  check("subscriberIds.*").isInt({ min: 1 }).withMessage("Subscriber IDs must be integers").toInt(),
];

export const getSubscribersValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("status")
    .optional()
    .isIn([...STATUSES, "all"])
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}, all`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
