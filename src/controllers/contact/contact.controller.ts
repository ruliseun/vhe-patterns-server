import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IContactQuery, IContactReply, ICreateContactRequest } from "../../interface/contact.interface";
import ContactRequestsService from "../../service/contact/contact.service";

const createContactRequest = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateContactRequest;
  try {
    const request = await ContactRequestsService.createContactRequest(data);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Contact request received",
      data: request,
    });
  } catch (error) {
    Logger.error("Error creating Contact request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error submitting contact request",
      data: null,
    });
  }
};

const getContactRequests = async (req: Request, res: Response) => {
  const data = matchedData(req) as IContactQuery;
  try {
    const { records, pagination } = await ContactRequestsService.getContactRequests(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Contact requests retrieved successfully",
      data: records,
      pagination,
    });
  } catch (error) {
    Logger.error("Error fetching Contact requests:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching contact requests",
      data: null,
    });
  }
};

const getContactRequest = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    const request = await ContactRequestsService.getContactRequest(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Contact request retrieved successfully",
      data: request,
    });
  } catch (error) {
    Logger.error("Error fetching Contact request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching contact request",
      data: null,
    });
  }
};

const replyToContactRequest = async (req: Request, res: Response) => {
  const data = matchedData(req) as IContactReply;
  try {
    const request = await ContactRequestsService.replyToContactRequest(data.id, data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Reply sent successfully",
      data: request,
    });
  } catch (error) {
    Logger.error("Error replying to Contact request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error sending reply",
      data: null,
    });
  }
};

const deleteContactRequest = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await ContactRequestsService.deleteContactRequest(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Contact request deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting Contact request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error deleting contact request",
      data: null,
    });
  }
};

const ContactRequestsController = {
  createContactRequest,
  getContactRequests,
  getContactRequest,
  replyToContactRequest,
  deleteContactRequest,
};

export default ContactRequestsController;
