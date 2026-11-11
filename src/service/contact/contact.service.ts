import ejs from "ejs";
import { marked } from "marked";
import path from "path";
import { ILike } from "typeorm";
import { PAGINATION } from "../../config/constants";
import { ContactRequest } from "../../entity/ContactRequest";
import { ContactStatusEnum } from "../../enums/contact.enum";
import { IContactQuery, IContactReply, ICreateContactRequest } from "../../interface/contact.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import EmailService from "../email/email.service";
import Logger from "../../utils/logger";

const SUPPORT_EMAIL = "support@vhepatterns.com";
const TEMPLATES_DIR = path.join(__dirname, "../../templates");

async function createContactRequest(data: ICreateContactRequest) {
  const request = await ABSTRACT_SERVICE.createData(ContactRequest, {
    ...data,
    status: ContactStatusEnum.PENDING,
  });

  try {
    const receivedAt = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
    const templateData = { ...request, receivedAt };

    const html = (await ejs.renderFile(path.join(TEMPLATES_DIR, "contact-notification.ejs"), templateData)) as string;
    const text = [
      `New contact request from ${request.firstName} ${request.lastName}`,
      `Email: ${request.email}`,
      request.phone ? `Phone: ${request.phone}` : "",
      request.company ? `Company: ${request.company}` : "",
      request.brand ? `Brand: ${request.brand}` : "",
      request.message ? `\nMessage:\n${request.message}` : "",
      `\nReceived ${receivedAt}`,
    ]
      .filter(Boolean)
      .join("\n");

    void EmailService.sendMail({
      receiverEmail: SUPPORT_EMAIL,
      subject: `New contact request from ${request.firstName} ${request.lastName}`,
      text,
      html,
    });
  } catch (error) {
    Logger.error("Error sending contact notification email:::", error);
  }

  return request;
}

async function getContactRequests(query: IContactQuery) {
  const { page = 1, status, search } = query;

  let where: { [key: string]: unknown } | { [key: string]: unknown }[] = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    const like = ILike(`%${search}%`);
    where = ["firstName", "lastName", "email", "brand"].map((field) => ({
      ...(status && status !== "all" ? { status } : {}),
      [field]: like,
    }));
  }

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(ContactRequest, Number(page) || 1, {
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

async function getContactRequest(id: number) {
  const request = await ABSTRACT_SERVICE.getUniqueData(ContactRequest, { id });
  if (!request) {
    throw createError("Contact request not found", 404);
  }
  return request;
}

async function replyToContactRequest(id: number, data: IContactReply) {
  const request = await getContactRequest(id);

  const body = marked.parse(data.message, { async: false }) as string;
  const html = (await ejs.renderFile(path.join(TEMPLATES_DIR, "contact-reply.ejs"), {
    subject: data.subject,
    firstName: request.firstName,
    body,
  })) as string;

  await EmailService.sendMail({
    receiverEmail: request.email,
    subject: data.subject,
    text: data.message,
    html,
  });

  await ABSTRACT_SERVICE.updateById(ContactRequest, id, {
    status: ContactStatusEnum.REPLIED,
    reply: data.message,
    repliedAt: new Date(),
  });

  return await getContactRequest(id);
}

async function deleteContactRequest(id: number) {
  const existing = await getContactRequest(id);
  if (!existing) {
    throw createError("Contact request not found", 404);
  }

  return await ABSTRACT_SERVICE.removeData(ContactRequest, { id });
}

const ContactRequestsService = {
  createContactRequest,
  getContactRequests,
  getContactRequest,
  replyToContactRequest,
  deleteContactRequest,
};

export default ContactRequestsService;
