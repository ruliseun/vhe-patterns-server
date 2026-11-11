import { check, query } from "express-validator";
import { ContactStatusEnum } from "../../enums/contact.enum";

export const validateCreateContactRequest = [
  check("firstName")
    .exists()
    .withMessage("First name is required")
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isString()
    .withMessage("First name must be a string")
    .trim(),
  check("lastName")
    .exists()
    .withMessage("Last name is required")
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isString()
    .withMessage("Last name must be a string")
    .trim(),
  check("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .normalizeEmail()
    .trim(),
  check("phone").optional().isString().withMessage("Phone must be a string").trim(),
  check("company").optional().isString().withMessage("Company must be a string").trim(),
  check("brand").optional().isString().withMessage("Brand must be a string").trim(),
  check("message").optional().isString().withMessage("Message must be a string").trim(),
];

export const validateContactReply = [
  check("subject")
    .exists()
    .withMessage("Subject is required")
    .notEmpty()
    .withMessage("Subject cannot be empty")
    .isString()
    .withMessage("Subject must be a string")
    .trim(),
  check("message")
    .exists()
    .withMessage("Message is required")
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isString()
    .withMessage("Message must be a string")
    .trim(),
];

export const getContactRequestsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("status")
    .optional()
    .isIn([...Object.values(ContactStatusEnum), "all"])
    .withMessage(`Status must be one of: ${Object.values(ContactStatusEnum).join(", ")}, all`),
  query("search").optional().isString().withMessage("Search must be a string").trim(),
];
