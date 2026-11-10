import { ILike } from "typeorm";
import { Category } from "../../entity/Category";
import { Design } from "../../entity/Design";
import { PAGINATION } from "../../config/constants";
import { DesignFlagEnum, DesignSortEnum, DesignStatusEnum } from "../../enums/design.enum";
import UploadConfig from "../../helpers/cloudinary-upload/uploads";
import { ICreateDesign, IDesignQuery, IUpdateDesign } from "../../interface/design.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { slugify } from "../../utils/helpers";

type DesignFiles = { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;

async function generateUniqueSlug(title: string, ignoreId?: number) {
  const base = slugify(title);
  let slug = base;
  let count = 1;
  let existing = await ABSTRACT_SERVICE.getUniqueData(Design, { slug });

  while (existing && existing.id !== ignoreId) {
    slug = `${base}-${++count}`;
    existing = await ABSTRACT_SERVICE.getUniqueData(Design, { slug });
  }

  return slug;
}

function parseVariations(value?: string[] | string): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : undefined;
  } catch {
    return undefined;
  }
}

async function resolveDesignImages(data: ICreateDesign | IUpdateDesign, files?: DesignFiles) {
  let mainImage = data.mainImage || undefined;
  let colorVariations = parseVariations(data.colorVariations);

  if (files && !Array.isArray(files)) {
    const mainFile = files.mainImage?.[0];

    if (mainFile) {
      const uploaded = await UploadConfig.uploadFile(mainFile);
      if (!uploaded.status) throw createError("Failed to upload main image", 500);
      mainImage = uploaded.location;
    }

    const variationFiles = files.colorVariations;
    if (variationFiles?.length) {
      const uploaded = await UploadConfig.uploadFileArray(variationFiles);
      if (!uploaded.status) throw createError("Failed to upload color variations", 500);
      colorVariations = (uploaded.location || [])
        .map((file: { location?: string }) => file.location)
        .filter(Boolean) as string[];
    }
  }

  return { mainImage, colorVariations };
}

async function assertCategoryExists(categoryId: number) {
  const category = await ABSTRACT_SERVICE.getUniqueData(Category, { id: categoryId });
  if (!category) {
    throw createError("Category not found", 404);
  }
  return category;
}

async function createDesign(data: ICreateDesign, files?: DesignFiles) {
  const { title, description, exclusivePrice, nonExclusivePrice, categoryId, status, flag } = data;

  const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(title);

  const slugExists = await ABSTRACT_SERVICE.getUniqueData(Design, { slug });

  if (slugExists) {
    throw createError("A design with this slug already exists", 400);
  }

  const { mainImage, colorVariations } = await resolveDesignImages(data, files);

  if (!mainImage) {
    throw createError("Main image is required", 400);
  }

  const category = await assertCategoryExists(Number(categoryId));

  const payload = {
    title,
    slug,
    description,
    mainImage,
    colorVariations,
    exclusivePrice,
    nonExclusivePrice,
    category,
    flag: flag || DesignFlagEnum.RECENT,
    status: status || DesignStatusEnum.ACTIVE,
  };

  return await ABSTRACT_SERVICE.createData(Design, payload);
}

async function getDesigns(query: IDesignQuery) {
  const { page = 1, sort, categoryId, status, flag, search } = query;

  const where: { [key: string]: unknown } = {};
  if (categoryId) where.categoryId = Number(categoryId);
  if (flag) where.flag = flag;
  if (search) where.title = ILike(`%${search}%`);

  if (status && status !== "all") {
    where.status = status;
  } else if (!status) {
    where.status = DesignStatusEnum.ACTIVE;
  }

  let order: { [key: string]: "ASC" | "DESC" } = { createdAt: "DESC" };

  if (sort === DesignSortEnum.POPULAR) {
    order = { flag: "ASC", createdAt: "DESC" };
  } else if (sort === DesignSortEnum.AZ) {
    order = { title: "ASC" };
  }

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(Design, Number(page) || 1, {
    where,
    order,
    relations: ["category"],
  });

  return {
    records,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: PAGINATION,
      totalPages: Math.ceil(total / PAGINATION),
    },
  };
}

async function getDesign(identifier: string) {
  let design = await ABSTRACT_SERVICE.findAndPopulate(Design, { slug: identifier }, ["category"]);

  if (!design && /^\d+$/.test(identifier)) {
    design = await ABSTRACT_SERVICE.findAndPopulate(Design, { id: Number(identifier) }, ["category"]);
  }

  if (!design) {
    throw createError("Design not found", 404);
  }

  return design;
}

async function updateDesign(id: number, data: IUpdateDesign, files?: DesignFiles) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Design, { id });
  if (!existing) {
    throw createError("Design not found", 404);
  }

  const updates: { [key: string]: unknown } = {};
  const updatableFields = ["title", "description", "exclusivePrice", "nonExclusivePrice", "status", "flag"];

  for (const key of updatableFields) {
    const value = data[key as keyof IUpdateDesign];
    if (value !== undefined && value !== "") {
      updates[key] = value;
    }
  }

  if (data.categoryId !== undefined) {
    await assertCategoryExists(Number(data.categoryId));
    updates.categoryId = Number(data.categoryId);
  }

  if (data.slug) {
    updates.slug = slugify(data.slug);
  }

  const { mainImage, colorVariations } = await resolveDesignImages(data, files);
  if (mainImage) updates.mainImage = mainImage;
  if (colorVariations) updates.colorVariations = colorVariations;

  if (data.title && data.title !== existing.title && !data.slug) {
    updates.slug = await generateUniqueSlug(data.title, id);
  }

  await ABSTRACT_SERVICE.updateById(Design, id, updates);

  return await ABSTRACT_SERVICE.getUniqueData(Design, { id });
}

async function deleteDesign(id: number) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Design, { id });
  if (!existing) {
    throw createError("Design not found", 404);
  }

  return await ABSTRACT_SERVICE.removeData(Design, { id });
}

const DesignsService = { createDesign, getDesigns, getDesign, updateDesign, deleteDesign };

export default DesignsService;
