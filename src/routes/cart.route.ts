import { Router } from "express";
import { validateKey } from "../config/api-key.config";
import CartController from "../controllers/cart/cart.controller";
import { validate } from "../middlewares/validate-request";
import {
  validateAddCartItem,
  validateCartSelection,
  validateGuestSession,
} from "../middlewares/validators/cart.validator";
import { validateRequiredId } from "../middlewares/validators/validator";

const router = Router();

router.post("/session", validateKey, CartController.createSession);

router.get("/", validateKey, validateGuestSession, validate, CartController.getCart);

router.post(
  "/items",
  validateKey,
  validateGuestSession,
  validateAddCartItem,
  validate,
  CartController.addItem,
);

router.patch(
  "/items/:id",
  validateKey,
  validateGuestSession,
  validateRequiredId("id"),
  validateCartSelection,
  validate,
  CartController.updateItem,
);

router.delete(
  "/items/:id",
  validateKey,
  validateGuestSession,
  validateRequiredId("id"),
  validate,
  CartController.removeItem,
);

router.patch("/selection", validateKey, validateGuestSession, validateCartSelection, validate, CartController.setSelection);

export default router;
