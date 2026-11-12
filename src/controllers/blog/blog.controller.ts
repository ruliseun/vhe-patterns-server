import { Request, Response } from "express";
import { matchedData } from "express-validator";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IBlogQuery, ICreateBlogPost, IUpdateBlogPost } from "../../interface/blog.interface";
import BlogService from "../../service/blog/blog.service";

const handleError = (res: Response, error: { httpStatusCode?: number; message?: string }, fallback: string) =>
  res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
    status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
    message: error.message || fallback,
    data: null,
  });

const createBlogPost = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICreateBlogPost;
  try {
    const post = await BlogService.createBlogPost(data, req.files);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Blog post created successfully",
      data: post,
    });
  } catch (error) {
    Logger.error("Error creating blog post:::", error);
    return handleError(res, error, "Error creating blog post");
  }
};

const getBlogPosts = async (req: Request, res: Response) => {
  const data = matchedData(req) as IBlogQuery;
  try {
    const { records, pagination } = await BlogService.getBlogPosts(data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Blog posts retrieved successfully",
      data: records,
      pagination,
    });
  } catch (error) {
    Logger.error("Error fetching blog posts:::", error);
    return handleError(res, error, "Error fetching blog posts");
  }
};

const getBlogPost = async (req: Request, res: Response) => {
  const { identifier } = matchedData(req);
  try {
    const post = await BlogService.getBlogPost(identifier);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Blog post retrieved successfully",
      data: post,
    });
  } catch (error) {
    Logger.error("Error fetching blog post:::", error);
    return handleError(res, error, "Error fetching blog post");
  }
};

const updateBlogPost = async (req: Request, res: Response) => {
  const data = matchedData(req) as IUpdateBlogPost;
  try {
    const post = await BlogService.updateBlogPost(Number(data.id), data, req.files);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Blog post updated successfully",
      data: post,
    });
  } catch (error) {
    Logger.error("Error updating blog post:::", error);
    return handleError(res, error, "Error updating blog post");
  }
};

const deleteBlogPost = async (req: Request, res: Response) => {
  const { id } = matchedData(req);
  try {
    await BlogService.deleteBlogPost(Number(id));

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Blog post deleted successfully",
      data: null,
    });
  } catch (error) {
    Logger.error("Error deleting blog post:::", error);
    return handleError(res, error, "Error deleting blog post");
  }
};

const uploadContentImage = async (req: Request, res: Response) => {
  try {
    const data = await BlogService.uploadContentImage(req.file);

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Image uploaded successfully",
      data,
    });
  } catch (error) {
    Logger.error("Error uploading blog image:::", error);
    return handleError(res, error, "Error uploading image");
  }
};

const BlogController = {
  createBlogPost,
  getBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadContentImage,
};

export default BlogController;
