import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { ResponseCodeEnum } from "../enums/response-codes.enum";
import JwtService from "../service/jwt.service";
import ABSTRACT_SERVICE from "../service/abstractService/abstractService";
import { RefreshToken } from "../entity/Token";
import { AppDataSource } from "../data-source";
import { Admin } from "../entity/Admin";
import { UserStatusEnum } from "../enums/user-type.enum";
import { IUser } from "../interface/user.interface";
import { ErrorMessages } from "../utils/error.constant";

export function internalUseGuard() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const internalUseHeader = req.headers["x-internal-use"];

      if (!internalUseHeader || internalUseHeader !== process.env.INTERNAL_USE_KEY) {
        Logger.warn(ErrorMessages.UNAUTHORIZED_INTERNAL_ACCESS + " attempt");
        return res
          .status(ResponseCodeEnum.UNAUTHORIZED)
          .json({ error: true, message: ErrorMessages.UNAUTHORIZED_INTERNAL_ACCESS, status: "401-INT" });
      }

      let token;

      if (req.headers.authorization) token = req.headers.authorization.split(" ")[1];

      if (!token) {
        Logger.warn(ErrorMessages.UNAUTHORIZED_INTERNAL_ACCESS + " - No token registered");
        return res.status(ResponseCodeEnum.UNAUTHORIZED).json({
          error: true,
          message: ErrorMessages.UNAUTHORIZED,
          status: "401-INT",
        });
      }

      const decodeToken = await JwtService.verifyToken(token);

      if (!decodeToken) {
        return res.status(ResponseCodeEnum.UNAUTHORIZED).json({
          error: true,
          message: ErrorMessages.INVALID_TOKEN,
          status: "401-INT",
        });
      }

      const { sub, platform } = decodeToken;

      const tokenAlive = await ABSTRACT_SERVICE.getUniqueData(RefreshToken, { user: sub, platform });

      if (tokenAlive && tokenAlive.is_revoked) {
        return res.status(ResponseCodeEnum.UNAUTHORIZED).json({
          error: true,
          message: ErrorMessages.UNAUTHORIZED,
          status: "401-INT",
        });
      }

      const adminRepository = AppDataSource.getRepository(Admin);

      const getUser = await adminRepository.findOne({
        where: { id: sub },
        relations: ["role", "role.permissions", "permissions"],
      });

      if (!getUser || getUser.status !== UserStatusEnum.ACTIVE) {
        return res.status(ResponseCodeEnum.UNAUTHORIZED).json({
          error: true,
          message: ErrorMessages.UNAUTHORIZED,
          status: "403-INT",
        });
      }

      (req as any).user = sub;
      (req as any).profile = getUser as unknown as Partial<IUser>;

      return next();
    } catch (ex) {
      Logger.error(ErrorMessages.INTERNAL_USE_GUARD_ERROR, ex);
      return res.status(ex.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: ex.message || ErrorMessages.SERVER_ERROR,
        status: ex.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      });
    }
  };
}
