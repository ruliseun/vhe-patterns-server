import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import {
  ICreateCustomPrintRequest,
  ICustomPrintQuery,
  IUpdateCustomPrintStatus,
} from "../../interface/custom-print.interface";
import CustomPrintRequestsService from "../../service/custom-print/custom-print.service";

const createCustomPrintRequest = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateCustomPrintRequest;
  try {
    const request = await CustomPrintRequestsService.createCustomPrintRequest(
      data,
      req.files as Express.Multer.File[] | undefined,
    );

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Custom print request received",
      data: request,
    });
  } catch (error) {
    Logger.error("Error creating Custom print request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error submitting custom print request",
      data: null,
    });
  }
};

const getCustomPrintRequests = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICustomPrintQuery;
  try {
    const { records, pagination } = await CustomPrintRequestsService.getCustomPrintRequests(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Custom print requests retrieved successfully",
      data: records,
      pagination,
    });
  } catch (error) {
    Logger.error("Error fetching Custom print requests:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching custom print requests",
      data: null,
    });
  }
};

const getCustomPrintRequest = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    const request = await CustomPrintRequestsService.getCustomPrintRequest(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Custom print request retrieved successfully",
      data: request,
    });
  } catch (error) {
    Logger.error("Error fetching Custom print request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching custom print request",
      data: null,
    });
  }
};

const updateCustomPrintStatus = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateCustomPrintStatus;
  try {
    const request = await CustomPrintRequestsService.updateCustomPrintStatus(data.id, data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: data.notifyCustomer ? "Status updated and customer notified" : "Status updated successfully",
      data: request,
    });
  } catch (error) {
    Logger.error("Error updating Custom print request status:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error updating custom print request status",
      data: null,
    });
  }
};

const deleteCustomPrintRequest = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await CustomPrintRequestsService.deleteCustomPrintRequest(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Custom print request deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting Custom print request:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error deleting custom print request",
      data: null,
    });
  }
};

const CustomPrintRequestsController = {
  createCustomPrintRequest,
  getCustomPrintRequests,
  getCustomPrintRequest,
  updateCustomPrintStatus,
  deleteCustomPrintRequest,
};

export default CustomPrintRequestsController;
