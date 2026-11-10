export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCategory {
  name: string;
  description?: string;
  slug?: string;
}

export interface IUpdateCategory extends Partial<ICreateCategory> {
  id: number;
}
