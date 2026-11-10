import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck";
import { getLogsValidator } from "../middlewares/validators/validator";
import { validate } from "../middlewares/validate-request";
import { getLogs } from "../audit/audit.trail";
import { permissionsGuard } from "../middlewares/permissions.guard";
import { authGuard } from "../middlewares/auth.guard";
import { ProfileTypeEnum } from "../enums/user-type.enum";
import { PermissionsEnum } from "../enums/permissions.enum";

const router = Router();

router.post("/", healthCheck);

router.get(
  "/logs",
  authGuard([ProfileTypeEnum.SUPER_ADMIN, ProfileTypeEnum.ADMIN]),
  permissionsGuard([PermissionsEnum.Can_Delete_Permissions]),
  getLogsValidator,
  validate,
  getLogs,
);

export default router;
