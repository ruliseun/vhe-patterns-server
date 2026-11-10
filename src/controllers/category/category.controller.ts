import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { ICreateCategory, IUpdateCategory } from "../../interface/category.interface";
import CategoriesService from "../../service/category/category.service";

const createCategory = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateCategory;
  try {
    const category = await CategoriesService.createCategory(data);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    Logger.error("Error creating Category:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error creating category",
      data: null,
    });
  }
};

const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoriesService.getCategories();

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    Logger.error("Error fetching Categories:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching categories",
      data: null,
    });
  }
};

const getCategory = async (req: Request, res: Response) => {
  const { identifier } = matchedData(req);
  try {
    const category = await CategoriesService.getCategory(identifier);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    Logger.error("Error fetching Category:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error fetching category",
      data: null,
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateCategory;
  try {
    if (Object.keys(data).length === 0) {
      return res.status(ResponseCodeEnum.BAD_REQUEST).json({
        status: ResponseCodeEnum.BAD_REQUEST,
        message: "No data to update",
        data: null,
      });
    }

    const category = await CategoriesService.updateCategory(data.id, data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    Logger.error("Error updating Category:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error updating category",
      data: null,
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await CategoriesService.deleteCategory(id);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting Category:::", error);
    res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
      status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
      message: error.message || "Error deleting category",
      data: null,
    });
  }
};

const CategoriesController = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };

export default CategoriesController;
