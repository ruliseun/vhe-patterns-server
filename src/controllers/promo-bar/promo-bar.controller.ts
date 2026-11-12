import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IUpdatePromoBar } from "../../interface/promo-bar.interface";
import PromoBarService from "../../service/promo-bar/promo-bar.service";
import Logger from "../../utils/logger";

const handleError = (res: Response, error: { httpStatusCode?: number; message?: string }, fallback: string) =>
  res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
    status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
    message: error.message || fallback,
    data: null,
  });

const getPromoBar = async (_req: Request, res: Response) => {
  try {
    const promoBar = await PromoBarService.getPromoBar();

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Promo bar retrieved successfully",
      data: promoBar,
    });
  } catch (error) {
    Logger.error("Error retrieving promo bar:::", error);
    return handleError(res, error, "Error retrieving promo bar");
  }
};

const updatePromoBar = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdatePromoBar;
  try {
    const promoBar = await PromoBarService.updatePromoBar(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Promo bar updated",
      data: promoBar,
    });
  } catch (error) {
    Logger.error("Error updating promo bar:::", error);
    return handleError(res, error, "Error updating promo bar");
  }
};

const PromoBarController = {
  getPromoBar,
  updatePromoBar,
};

export default PromoBarController;
