import { BrandStatusEnum } from "../enums/brand.enum";

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  excerpt?: string;
  description?: string;
  mainImage: string;
  gallery?: string[];
  status: BrandStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBrand {
  name: string;
  excerpt?: string;
  description?: string;
  status?: BrandStatusEnum;
  slug?: string;
  mainImage?: string;
  gallery?: string[] | string;
}

export interface IUpdateBrand extends Partial<ICreateBrand> {
  id: number;
}

export interface IBrandQuery {
  page?: number | string;
  status?: BrandStatusEnum | "all";
  search?: string;
}
