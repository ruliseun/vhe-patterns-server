import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { dynamicKeySelector, validateKey } from "../config/api-key.config";
import {
  refeshTokenValidator,
  requestOTPValidator,
  validateCreateUser,
  validateEmail,
  validateLogin,
  validateLogout,
  validateOTPValidator,
  validateResetPassword,
  verifyEmailTokenValidator,
} from "../middlewares/validators/auth.validator";
import AuthController from "../controllers/auth/auth.controller";
import { logAuditTrails } from "../audit/audit.trail";

const router = Router();

router.post("/login", logAuditTrails, dynamicKeySelector, validateLogin, validate, AuthController.login);
router.post("/logout", logAuditTrails, validateKey, validateLogout, validate, AuthController.logout);
router.post("/token", validateKey, refeshTokenValidator, validate, AuthController.refreshToken);
router.post("/register", logAuditTrails, validateKey, validateCreateUser, validate, AuthController.signup);
router.post(
  "/forgot_password",
  logAuditTrails,
  dynamicKeySelector,
  validateEmail,
  validate,
  AuthController.forgotPasswordRequest,
);
router.post(
  "/reset_password",
  logAuditTrails,
  dynamicKeySelector,
  validateEmail,
  validateResetPassword,
  validate,
  AuthController.resetPassword,
);
router.get(
  "/resend_verification/:token",
  verifyEmailTokenValidator,
  validate,
  AuthController.resendVerificationEmailToken,
);
router.get("/verify/:token", logAuditTrails, verifyEmailTokenValidator, validate, AuthController.verifyProfileEmail);
router.post("/request/otp", validateKey, requestOTPValidator, validate, AuthController.requestOTP);
router.post("/validate/otp", validateKey, validateOTPValidator, validate, AuthController.validateOTP);

export default router;
