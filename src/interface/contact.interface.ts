import { ContactStatusEnum } from "../enums/contact.enum";

export interface IContactRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  brand?: string;
  message?: string;
  status: ContactStatusEnum;
  reply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  brand?: string;
  message?: string;
}

export interface IContactQuery {
  page?: number | string;
  status?: ContactStatusEnum | "all";
  search?: string;
}

export interface IContactReply {
  id: number;
  subject: string;
  message: string;
}
