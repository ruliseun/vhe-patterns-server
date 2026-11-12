import ejs from "ejs";
import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { frontendBaseUrl } from "../../config/env";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { templatePath } from "../../helpers/templates";
import {
  INewsletterBroadcast,
  INewsletterQuery,
  ISubscribeNewsletter,
  IUpdateSubscriberStatus,
} from "../../interface/newsletter.interface";
import NewsletterService from "../../service/newsletter/newsletter.service";

const handleError = (res: Response, error: { httpStatusCode?: number; message?: string }, fallback: string) =>
  res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
    status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
    message: error.message || fallback,
    data: null,
  });

const subscribe = async (req: Request, res: Response) => {
  const data = matchedData(req) as ISubscribeNewsletter;
  try {
    const { subscriber, created } = await NewsletterService.subscribe(data);
    const status = created ? ResponseCodeEnum.CREATED : ResponseCodeEnum.OK;

    return res.status(status).json({
      status,
      message: "Subscribed to newsletter",
      data: { email: subscriber.email },
    });
  } catch (error) {
    Logger.error("Error subscribing to newsletter:::", error);
    return handleError(res, error, "Error subscribing to newsletter");
  }
};

const getSubscribers = async (req: Request, res: Response) => {
  const data = matchedData(req) as INewsletterQuery;
  try {
    const { records, pagination, activeTotal } = await NewsletterService.getSubscribers(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Newsletter subscribers retrieved successfully",
      data: records,
      pagination,
      meta: { activeTotal },
    });
  } catch (error) {
    Logger.error("Error retrieving newsletter subscribers:::", error);
    return handleError(res, error, "Error retrieving newsletter subscribers");
  }
};

const updateSubscriberStatus = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateSubscriberStatus;
  try {
    const subscriber = await NewsletterService.updateSubscriberStatus({ ...data, id: Number(req.params.id) });

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Subscriber status updated",
      data: subscriber,
    });
  } catch (error) {
    Logger.error("Error updating subscriber status:::", error);
    return handleError(res, error, "Error updating subscriber status");
  }
};

const sendBroadcast = async (req: Request, res: Response) => {
  const data = matchedData(req) as INewsletterBroadcast;
  try {
    const result = await NewsletterService.sendBroadcast(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: `Newsletter sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}`,
      data: result,
    });
  } catch (error) {
    Logger.error("Error sending newsletter broadcast:::", error);
    return handleError(res, error, "Error sending newsletter broadcast");
  }
};

const tokenFrom = (req: Request) => (typeof req.query.token === "string" ? req.query.token : "");

const renderUnsubscribePage = async (res: Response, status: number, success: boolean, email?: string) => {
  const html = (await ejs.renderFile(templatePath("newsletter-unsubscribed.ejs"), {
    success,
    email,
    siteUrl: frontendBaseUrl || "https://vhepatterns.com",
  })) as string;
  return res.status(status).type("html").send(html);
};

const unsubscribePage = async (req: Request, res: Response) => {
  try {
    const subscriber = await NewsletterService.unsubscribe(tokenFrom(req));
    return await renderUnsubscribePage(res, ResponseCodeEnum.OK, true, subscriber.email);
  } catch (error) {
    Logger.error("Error unsubscribing from newsletter:::", error);
    return await renderUnsubscribePage(res, error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR, false);
  }
};

// One-click unsubscribe (RFC 8058) for mail clients that POST to the link.
const unsubscribeOneClick = async (req: Request, res: Response) => {
  try {
    await NewsletterService.unsubscribe(tokenFrom(req));
    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Unsubscribed from newsletter",
      data: null,
    });
  } catch (error) {
    Logger.error("Error unsubscribing from newsletter:::", error);
    return handleError(res, error, "Error unsubscribing from newsletter");
  }
};

const NewsletterController = {
  subscribe,
  getSubscribers,
  updateSubscriberStatus,
  sendBroadcast,
  unsubscribePage,
  unsubscribeOneClick,
};

export default NewsletterController;
