import { CustomPrintStatusEnum } from "../enums/custom-print.enum";

export interface ICreateCustomPrintRequest {
  firstName: string;
  lastName: string;
  brand?: string;
  email: string;
  phone: string;
  altPhone?: string;
  service: string;
  quantity: number;
  description: string;
  references?: string;
  timeline: string;
  fabric?: string;
  budget?: string;
  message?: string;
}

export interface ICustomPrintQuery {
  page?: number | string;
  status?: CustomPrintStatusEnum | "all";
  search?: string;
}

export interface IUpdateCustomPrintStatus {
  id: number;
  status: CustomPrintStatusEnum;
  notifyCustomer?: boolean;
  note?: string;
}
