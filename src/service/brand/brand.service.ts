import { ILike } from "typeorm";
import { Brand } from "../../entity/Brand";
import { PAGINATION } from "../../config/constants";
import { BrandStatusEnum } from "../../enums/brand.enum";
import UploadConfig from "../../helpers/cloudinary-upload/uploads";
import { ICreateBrand, IBrandQuery, IUpdateBrand } from "../../interface/brand.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { slugify } from "../../utils/helpers";

type BrandFiles = { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;

const MAX_GALLERY_IMAGES = 6;

async function generateUniqueSlug(name: string, ignoreId?: number) {
  const base = slugify(name);
  let slug = base;
  let count = 1;
  let existing = await ABSTRACT_SERVICE.getUniqueData(Brand, { slug });

  while (existing && existing.id !== ignoreId) {
    slug = `${base}-${++count}`;
    existing = await ABSTRACT_SERVICE.getUniqueData(Brand, { slug });
  }

  return slug;
}

function parseGallery(value?: string[] | string): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, MAX_GALLERY_IMAGES);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, MAX_GALLERY_IMAGES) : undefined;
  } catch {
    return undefined;
  }
}

async function resolveBrandImages(data: ICreateBrand | IUpdateBrand, files?: BrandFiles) {
  let mainImage = data.mainImage || undefined;
  let gallery = parseGallery(data.gallery);

  if (files && !Array.isArray(files)) {
    const mainFile = files.mainImage?.[0];

    if (mainFile) {
      const uploaded = await UploadConfig.uploadFile(mainFile);
      if (!uploaded.status) throw createError("Failed to upload main image", 500);
      mainImage = uploaded.location;
    }

    const galleryFiles = files.gallery;
    if (galleryFiles?.length) {
      const uploaded = await UploadConfig.uploadFileArray(galleryFiles.slice(0, MAX_GALLERY_IMAGES));
      if (!uploaded.status) throw createError("Failed to upload gallery images", 500);
      gallery = (uploaded.location || [])
        .map((file: { location?: string }) => file.location)
        .filter(Boolean) as string[];
    }
  }

  return { mainImage, gallery };
}

async function createBrand(data: ICreateBrand, files?: BrandFiles) {
  const { name, excerpt, description, status } = data;

  const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(name);

  const slugExists = await ABSTRACT_SERVICE.getUniqueData(Brand, { slug });
  if (slugExists) {
    throw createError("A brand with this slug already exists", 400);
  }

  const { mainImage, gallery } = await resolveBrandImages(data, files);

  if (!mainImage) {
    throw createError("Main image is required", 400);
  }

  const payload = {
    name,
    slug,
    excerpt,
    description,
    mainImage,
    gallery,
    status: status || BrandStatusEnum.ACTIVE,
  };

  return await ABSTRACT_SERVICE.createData(Brand, payload);
}

async function getBrands(query: IBrandQuery) {
  const { page = 1, status, search } = query;

  const where: { [key: string]: unknown } = {};
  if (search) where.name = ILike(`%${search}%`);

  if (status && status !== "all") {
    where.status = status;
  } else if (!status) {
    where.status = BrandStatusEnum.ACTIVE;
  }

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(Brand, Number(page) || 1, {
    where,
    order: { createdAt: "DESC" },
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

async function getBrand(identifier: string) {
  let brand = await ABSTRACT_SERVICE.getUniqueData(Brand, { slug: identifier });

  if (!brand && /^\d+$/.test(identifier)) {
    brand = await ABSTRACT_SERVICE.getUniqueData(Brand, { id: Number(identifier) });
  }

  if (!brand) {
    throw createError("Brand not found", 404);
  }

  return brand;
}

async function updateBrand(id: number, data: IUpdateBrand, files?: BrandFiles) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Brand, { id });
  if (!existing) {
    throw createError("Brand not found", 404);
  }

  const updates: { [key: string]: unknown } = {};
  const updatableFields = ["name", "excerpt", "description", "status"];

  for (const key of updatableFields) {
    const value = data[key as keyof IUpdateBrand];
    if (value !== undefined && value !== "") {
      updates[key] = value;
    }
  }

  if (data.slug) {
    updates.slug = slugify(data.slug);
  }

  const { mainImage, gallery } = await resolveBrandImages(data, files);
  if (mainImage) updates.mainImage = mainImage;
  if (gallery) updates.gallery = gallery;

  if (data.name && data.name !== existing.name && !data.slug) {
    updates.slug = await generateUniqueSlug(data.name, id);
  }

  await ABSTRACT_SERVICE.updateById(Brand, id, updates);

  return await ABSTRACT_SERVICE.getUniqueData(Brand, { id });
}

async function deleteBrand(id: number) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Brand, { id });
  if (!existing) {
    throw createError("Brand not found", 404);
  }

  return await ABSTRACT_SERVICE.removeData(Brand, { id });
}

const BrandsService = { createBrand, getBrands, getBrand, updateBrand, deleteBrand };

export default BrandsService;
