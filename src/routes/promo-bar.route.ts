import { Router } from "express";
import { validateKey } from "../config/api-key.config";
import PromoBarController from "../controllers/promo-bar/promo-bar.controller";
import { validate } from "../middlewares/validate-request";
import { validateUpdatePromoBar } from "../middlewares/validators/promo-bar.validator";

const router = Router();

router.get("/", validateKey, PromoBarController.getPromoBar);

router.patch("/", validateKey, validateUpdatePromoBar, validate, PromoBarController.updatePromoBar);

export default router;
