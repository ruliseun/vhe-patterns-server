import { ILike } from "typeorm";
import { PAGINATION } from "../../config/constants";
import { BlogPost } from "../../entity/BlogPost";
import { BlogStatusEnum } from "../../enums/blog.enum";
import UploadConfig from "../../helpers/cloudinary-upload/uploads";
import { IBlogQuery, ICreateBlogPost, IUpdateBlogPost } from "../../interface/blog.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { slugify } from "../../utils/helpers";

type BlogFiles = { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;

async function generateUniqueSlug(title: string, ignoreId?: number) {
  const base = slugify(title);
  let slug = base;
  let count = 1;
  let existing = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { slug });

  while (existing && existing.id !== ignoreId) {
    slug = `${base}-${++count}`;
    existing = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { slug });
  }

  return slug;
}

async function uploadImage(file: Express.Multer.File) {
  const uploaded = await UploadConfig.uploadFile(file, { crop: false });
  if (!uploaded.status) throw createError("Failed to upload image", 500);
  return uploaded.location as string;
}

async function uploadMainImage(files?: BlogFiles) {
  const file = files && !Array.isArray(files) ? files.mainImage?.[0] : undefined;
  return file ? await uploadImage(file) : undefined;
}

async function createBlogPost(data: ICreateBlogPost, files?: BlogFiles) {
  const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(data.title);

  const slugExists = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { slug });
  if (slugExists) {
    throw createError("A blog post with this slug already exists", 400);
  }

  const mainImage = await uploadMainImage(files);
  if (!mainImage) {
    throw createError("Main image is required", 400);
  }

  return await ABSTRACT_SERVICE.createData(BlogPost, {
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content,
    mainImage,
    status: data.status || BlogStatusEnum.ACTIVE,
  });
}

async function getBlogPosts(query: IBlogQuery) {
  const { page = 1, status, search } = query;

  const where: { [key: string]: unknown } = {};
  if (search) where.title = ILike(`%${search}%`);

  if (status && status !== "all") {
    where.status = status;
  } else if (!status) {
    where.status = BlogStatusEnum.ACTIVE;
  }

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(BlogPost, Number(page) || 1, {
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

async function getBlogPost(identifier: string) {
  let post = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { slug: identifier });

  if (!post && /^\d+$/.test(identifier)) {
    post = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { id: Number(identifier) });
  }

  if (!post) {
    throw createError("Blog post not found", 404);
  }

  return post as BlogPost;
}

async function updateBlogPost(id: number, data: IUpdateBlogPost, files?: BlogFiles) {
  const existing = (await ABSTRACT_SERVICE.getUniqueData(BlogPost, { id })) as BlogPost | null;
  if (!existing) {
    throw createError("Blog post not found", 404);
  }

  const updates: { [key: string]: unknown } = {};

  for (const key of ["title", "content", "status"] as const) {
    const value = data[key];
    if (value !== undefined && value !== "") updates[key] = value;
  }

  if (data.excerpt !== undefined) updates.excerpt = data.excerpt || null;

  if (data.slug) {
    const slug = slugify(data.slug);
    const taken = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { slug });
    if (taken && taken.id !== id) throw createError("A blog post with this slug already exists", 400);
    updates.slug = slug;
  } else if (data.title && data.title !== existing.title) {
    updates.slug = await generateUniqueSlug(data.title, id);
  }

  const mainImage = await uploadMainImage(files);
  if (mainImage) updates.mainImage = mainImage;

  await ABSTRACT_SERVICE.updateById(BlogPost, id, updates);

  return await ABSTRACT_SERVICE.getUniqueData(BlogPost, { id });
}

async function deleteBlogPost(id: number) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(BlogPost, { id });
  if (!existing) {
    throw createError("Blog post not found", 404);
  }

  return await ABSTRACT_SERVICE.removeData(BlogPost, { id });
}

async function uploadContentImage(file?: Express.Multer.File) {
  if (!file) throw createError("Image is required", 400);
  return { url: await uploadImage(file) };
}

const BlogService = {
  createBlogPost,
  getBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadContentImage,
};

export default BlogService;
