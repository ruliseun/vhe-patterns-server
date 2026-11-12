import { BlogStatusEnum } from "../enums/blog.enum";

export interface ICreateBlogPost {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status?: BlogStatusEnum;
}

export interface IUpdateBlogPost extends Partial<ICreateBlogPost> {
  id: number;
}

export interface IBlogQuery {
  page?: number | string;
  status?: BlogStatusEnum | "all";
  search?: string;
}
