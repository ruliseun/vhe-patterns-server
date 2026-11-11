import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { ICreateBrand, IBrandQuery, IUpdateBrand } from "../../interface/brand.interface";
import BrandsService from "../../service/brand/brand.service";

const createBrand = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateBrand;
  try {
    const brand = await BrandsService.createBrand(data, req.files);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    Logger.error("Error creating Brand:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error creating brand",
      data: null,
    });
  }
};

const getBrands = async (req: Request, res: Response) => {
  const data = matchedData(req) as IBrandQuery;
  try {
    const { records, pagination } = await BrandsService.getBrands(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Brands retrieved successfully",
      data: records,
      pagination,
    });
  } catch (error) {
    Logger.error("Error fetching Brands:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching brands",
      data: null,
    });
  }
};

const getBrand = async (req: Request, res: Response) => {
  const { identifier } = matchedData(req);
  try {
    const brand = await BrandsService.getBrand(identifier);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Brand retrieved successfully",
      data: brand,
    });
  } catch (error) {
    Logger.error("Error fetching Brand:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching brand",
      data: null,
    });
  }
};

const updateBrand = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateBrand;
  try {
    if (Object.keys(data).length === 0 && !req.files) {
      return res.status(ResponseCodeEnum.BAD_REQUEST).json({
        status: ResponseCodeEnum.BAD_REQUEST,
        message: "No data to update",
        data: null,
      });
    }

    const brand = await BrandsService.updateBrand(data.id, data, req.files);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    Logger.error("Error updating Brand:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error updating brand",
      data: null,
    });
  }
};

const deleteBrand = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await BrandsService.deleteBrand(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Brand deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting Brand:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error deleting brand",
      data: null,
    });
  }
};

const BrandsController = { createBrand, getBrands, getBrand, updateBrand, deleteBrand };

export default BrandsController;
