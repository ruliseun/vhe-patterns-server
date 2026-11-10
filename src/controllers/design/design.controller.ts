import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { ICreateDesign, IDesignQuery, IUpdateDesign } from "../../interface/design.interface";
import DesignsService from "../../service/design/design.service";

const createDesign = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateDesign;
  try {
    const design = await DesignsService.createDesign(data, req.files);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Design created successfully",
      data: design,
    });
  } catch (error) {
    Logger.error("Error creating Design:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error creating design",
      data: null,
    });
  }
};

const getDesigns = async (req: Request, res: Response) => {
  const data = matchedData(req) as IDesignQuery;
  try {
    const { records, pagination } = await DesignsService.getDesigns(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Designs retrieved successfully",
      data: records,
      pagination,
    });
  } catch (error) {
    Logger.error("Error fetching Designs:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching designs",
      data: null,
    });
  }
};

const getDesign = async (req: Request, res: Response) => {
  const { identifier } = matchedData(req);
  try {
    const design = await DesignsService.getDesign(identifier);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Design retrieved successfully",
      data: design,
    });
  } catch (error) {
    Logger.error("Error fetching Design:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching design",
      data: null,
    });
  }
};

const updateDesign = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateDesign;
  try {
    if (Object.keys(data).length === 0 && !req.files) {
      return res.status(ResponseCodeEnum.BAD_REQUEST).json({
        status: ResponseCodeEnum.BAD_REQUEST,
        message: "No data to update",
        data: null,
      });
    }

    const design = await DesignsService.updateDesign(data.id, data, req.files);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Design updated successfully",
      data: design,
    });
  } catch (error) {
    Logger.error("Error updating Design:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error updating design",
      data: null,
    });
  }
};

const deleteDesign = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await DesignsService.deleteDesign(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Design deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting Design:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error deleting design",
      data: null,
    });
  }
};

const DesignsController = { createDesign, getDesigns, getDesign, updateDesign, deleteDesign };

export default DesignsController;
