import ejs from "ejs";
import { ILike } from "typeorm";
import { PAGINATION } from "../../config/constants";
import { CustomPrintRequest } from "../../entity/CustomPrintRequest";
import { CustomPrintStatusEnum } from "../../enums/custom-print.enum";
import UploadConfig from "../../helpers/cloudinary-upload/uploads";
import {
  ICreateCustomPrintRequest,
  ICustomPrintQuery,
  IUpdateCustomPrintStatus,
} from "../../interface/custom-print.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import EmailService from "../email/email.service";
import Logger from "../../utils/logger";
import { templatePath } from "../../helpers/templates";

const SUPPORT_EMAIL = "support@vhepatterns.com";

type NotifiableStatus = Exclude<CustomPrintStatusEnum, CustomPrintStatusEnum.PENDING>;

const STATUS_EMAILS: Record<NotifiableStatus, { subject: string; heading: string; body: string; accent: string }> = {
  [CustomPrintStatusEnum.ONGOING]: {
    subject: "Work has started on your custom print",
    heading: "We've started on your custom print",
    body:
      "Good news! Our team has reviewed your request and work on your custom print is now underway. " +
      "We'll keep you posted as it progresses.",
    accent: "#e2604f",
  },
  [CustomPrintStatusEnum.PAUSED]: {
    subject: "Your custom print request is on hold",
    heading: "Your custom print is on hold",
    body: "We've temporarily paused work on your custom print request. We'll pick it back up as soon as possible and let you know when it resumes.",
    accent: "#d99a2b",
  },
  [CustomPrintStatusEnum.COMPLETED]: {
    subject: "Your custom print is ready",
    heading: "Your custom print is complete",
    body: "Your custom print is complete! Thank you for choosing VhePatterns. Our team will be in touch with the next steps for delivery.",
    accent: "#2f9e61",
  },
  [CustomPrintStatusEnum.CANCELLED]: {
    subject: "Your custom print request has been cancelled",
    heading: "Your custom print request was cancelled",
    body:
      "Your custom print request has been cancelled. " +
      "If you think this is a mistake or would like to start a new request, just reply to this email.",
    accent: "#8a8a8a",
  },
};

const formatDateTime = (date: Date) => date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

async function uploadReferenceImages(files?: Express.Multer.File[]) {
  if (!files?.length) return [];

  const uploaded = await UploadConfig.uploadFileArray(files, { crop: false });
  return (uploaded.location || []).map((file: { location?: string }) => file.location).filter(Boolean) as string[];
}

async function notifySupport(request: CustomPrintRequest) {
  try {
    const receivedAt = formatDateTime(new Date(request.createdAt));
    const html = (await ejs.renderFile(templatePath("custom-print-notification.ejs"), {
      ...request,
      receivedAt,
    })) as string;

    const text = [
      `New custom print request from ${request.firstName} ${request.lastName}`,
      request.brand ? `Brand: ${request.brand}` : "",
      `Email: ${request.email}`,
      `Phone: ${request.phone}`,
      request.altPhone ? `Alternative phone: ${request.altPhone}` : "",
      `\nService: ${request.service}`,
      `Quantity: ${request.quantity}`,
      `Timeline: ${request.timeline}`,
      request.fabric ? `Fabric: ${request.fabric}` : "",
      request.budget ? `Budget: ${request.budget}` : "",
      `\nDescription:\n${request.description}`,
      request.references ? `\nReferences:\n${request.references}` : "",
      request.images?.length ? `\nReference images:\n${request.images.join("\n")}` : "",
      request.message ? `\nAdditional message:\n${request.message}` : "",
      `\nReceived ${receivedAt}`,
    ]
      .filter(Boolean)
      .join("\n");

    void EmailService.sendMail({
      receiverEmail: SUPPORT_EMAIL,
      subject: `New custom print request from ${request.firstName} ${request.lastName}`,
      text,
      html,
    });
  } catch (error) {
    Logger.error("Error sending custom print notification email:::", error);
  }
}

async function createCustomPrintRequest(data: ICreateCustomPrintRequest, files?: Express.Multer.File[]) {
  if (!data.references && !files?.length) {
    throw createError("Please add a reference link or at least one reference image", 400);
  }

  const images = await uploadReferenceImages(files);
  if (files?.length && !images.length) {
    throw createError("Failed to upload reference images", 500);
  }

  const request = await ABSTRACT_SERVICE.createData(CustomPrintRequest, {
    ...data,
    images,
    status: CustomPrintStatusEnum.PENDING,
  });

  await notifySupport(request);

  return request;
}

async function getCustomPrintRequests(query: ICustomPrintQuery) {
  const { page = 1, status, search } = query;
  const statusFilter = status && status !== "all" ? { status } : {};

  let where: { [key: string]: unknown } | { [key: string]: unknown }[] = statusFilter;

  if (search) {
    const like = ILike(`%${search}%`);
    where = ["firstName", "lastName", "email", "brand", "service"].map((field) => ({
      ...statusFilter,
      [field]: like,
    }));
  }

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(CustomPrintRequest, Number(page) || 1, {
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

async function getCustomPrintRequest(id: number) {
  const request = await ABSTRACT_SERVICE.getUniqueData(CustomPrintRequest, { id });
  if (!request) {
    throw createError("Custom print request not found", 404);
  }
  return request as CustomPrintRequest;
}

async function notifyCustomer(request: CustomPrintRequest, status: NotifiableStatus, note?: string) {
  const content = STATUS_EMAILS[status];
  const html = (await ejs.renderFile(templatePath("custom-print-status.ejs"), {
    ...content,
    firstName: request.firstName,
    service: request.service,
    quantity: request.quantity,
    submittedAt: formatDateTime(new Date(request.createdAt)),
    note: note || "",
  })) as string;

  const text = [
    `Hi ${request.firstName},`,
    content.body,
    note ? `\nNote from our team:\n${note}` : "",
    `\nRequest: ${request.service} (quantity: ${request.quantity})`,
    "\nWarm regards,\nThe VhePatterns Team",
  ]
    .filter(Boolean)
    .join("\n");

  await EmailService.sendMail({
    receiverEmail: request.email,
    subject: content.subject,
    text,
    html,
  });
}

async function updateCustomPrintStatus(id: number, data: IUpdateCustomPrintStatus) {
  const request = await getCustomPrintRequest(id);

  if (data.notifyCustomer && data.status === CustomPrintStatusEnum.PENDING) {
    throw createError("Customers are not notified when a request is moved back to pending", 400);
  }

  await ABSTRACT_SERVICE.updateById(CustomPrintRequest, id, {
    status: data.status,
    statusUpdatedAt: new Date(),
  });

  if (data.notifyCustomer) {
    await notifyCustomer(request, data.status as NotifiableStatus, data.note);
  }

  return await getCustomPrintRequest(id);
}

async function deleteCustomPrintRequest(id: number) {
  await getCustomPrintRequest(id);
  return await ABSTRACT_SERVICE.removeData(CustomPrintRequest, { id });
}

const CustomPrintRequestsService = {
  createCustomPrintRequest,
  getCustomPrintRequests,
  getCustomPrintRequest,
  updateCustomPrintStatus,
  deleteCustomPrintRequest,
};

export default CustomPrintRequestsService;
