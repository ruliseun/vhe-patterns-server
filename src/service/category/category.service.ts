import { Category } from "../../entity/Category";
import { Design } from "../../entity/Design";
import { ICreateCategory, IUpdateCategory } from "../../interface/category.interface";
import { slugify } from "../../utils/helpers";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";

async function assertSlugIsFree(slug: string, ignoreId?: number) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Category, { slug });
  if (existing && existing.id !== ignoreId) {
    throw createError("A category with this name already exists", 400);
  }
}

async function createCategory(data: ICreateCategory) {
  const { name, description } = data;
  const slug = slugify(data.slug || name);

  await assertSlugIsFree(slug);

  return await ABSTRACT_SERVICE.createData(Category, { name, slug, description });
}

async function getCategories() {
  return await ABSTRACT_SERVICE.getAllData(Category, { order: { name: "ASC" } });
}

async function getCategory(identifier: string) {
  let category = await ABSTRACT_SERVICE.findAndPopulate(Category, { slug: identifier }, ["designs"]);

  if (!category && /^\d+$/.test(identifier)) {
    category = await ABSTRACT_SERVICE.findAndPopulate(Category, { id: Number(identifier) }, ["designs"]);
  }

  if (!category) {
    throw createError("Category not found", 404);
  }

  return category;
}

async function updateCategory(id: number, data: IUpdateCategory) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Category, { id });
  if (!existing) {
    throw createError("Category not found", 404);
  }

  const updates: { [key: string]: unknown } = {};
  const updatableFields = ["name", "description"];

  for (const key of updatableFields) {
    const value = data[key as keyof IUpdateCategory];
    if (value !== undefined && value !== "") {
      updates[key] = value;
    }
  }

  if (data.slug) {
    const slug = slugify(data.slug);
    await assertSlugIsFree(slug, id);
    updates.slug = slug;
  } else if (data.name && data.name !== existing.name) {
    const slug = slugify(data.name);
    await assertSlugIsFree(slug, id);
    updates.slug = slug;
  }

  await ABSTRACT_SERVICE.updateById(Category, id, updates);

  return await ABSTRACT_SERVICE.getUniqueData(Category, { id });
}

async function deleteCategory(id: number) {
  const existing = await ABSTRACT_SERVICE.getUniqueData(Category, { id });
  if (!existing) {
    throw createError("Category not found", 404);
  }

  const designsInCategory = await ABSTRACT_SERVICE.getAllData(Design, { where: { categoryId: id }, take: 1 });
  if (designsInCategory.length) {
    throw createError("Category still has designs. Reassign or delete them first.", 400);
  }

  return await ABSTRACT_SERVICE.removeData(Category, { id });
}

const CategoriesService = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };

export default CategoriesService;
