import { DesignFlagEnum, DesignSortEnum, DesignStatusEnum } from "../enums/design.enum";
import { ICategory } from "./category.interface";

export interface IDesign {
  id: number;
  title: string;
  slug: string;
  description?: string;
  mainImage: string;
  colorVariations?: string[];
  exclusivePrice: number;
  nonExclusivePrice: number;
  category?: ICategory;
  categoryId?: number;
  status: DesignStatusEnum;
  flag?: DesignFlagEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateDesign {
  title: string;
  description?: string;
  exclusivePrice: number;
  nonExclusivePrice: number;
  categoryId: number;
  status?: DesignStatusEnum;
  flag?: DesignFlagEnum;
  slug?: string;
  mainImage?: string;
  colorVariations?: string[] | string;
}

export interface IUpdateDesign extends Partial<ICreateDesign> {
  id: number;
}

export interface IDesignQuery {
  page?: number | string;
  sort?: DesignSortEnum;
  categoryId?: number | string;
  status?: DesignStatusEnum | "all";
  flag?: DesignFlagEnum;
  search?: string;
}
