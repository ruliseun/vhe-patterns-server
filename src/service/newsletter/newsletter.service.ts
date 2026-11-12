import ejs from "ejs";
import { marked } from "marked";
import { ILike, In } from "typeorm";
import { PAGINATION } from "../../config/constants";
import { baseApiURL, nodeEnv } from "../../config/env";
import { AppDataSource } from "../../data-source";
import { NewsletterSubscriber } from "../../entity/NewsletterSubscriber";
import { Environments } from "../../enums/env.enum";
import { NewsletterStatusEnum } from "../../enums/newsletter.enum";
import {
  INewsletterBroadcast,
  INewsletterQuery,
  ISubscribeNewsletter,
  IUpdateSubscriberStatus,
} from "../../interface/newsletter.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import BroadcastEmailService from "../email/broadcast-email.service";
import { templatePath } from "../../helpers/templates";
import {
  createUnsubscribeToken,
  isValidUnsubscribeSignature,
  parseUnsubscribeToken,
} from "../../helpers/unsubscribe-token";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";

// Mailgun accepts at most 1,000 recipients per batch message.
const BROADCAST_BATCH_SIZE = 1000;
const UNSUBSCRIBE_PLACEHOLDER = "%recipient.unsubscribeUrl%";

const unsubscribeUrl = (id: number, email: string) =>
  `${baseApiURL}/newsletter/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(id, email))}`;

async function subscribe({ email }: ISubscribeNewsletter) {
  const existing = (await ABSTRACT_SERVICE.getUniqueData(NewsletterSubscriber, {
    email,
  })) as NewsletterSubscriber | null;

  if (!existing) {
    const subscriber = await ABSTRACT_SERVICE.createData(NewsletterSubscriber, {
      email,
      status: NewsletterStatusEnum.ACTIVE,
    });
    return { subscriber, created: true };
  }

  if (existing.status === NewsletterStatusEnum.INACTIVE) {
    await ABSTRACT_SERVICE.updateById(NewsletterSubscriber, existing.id, {
      status: NewsletterStatusEnum.ACTIVE,
      statusUpdatedAt: new Date(),
    });
  }

  if (existing.status === NewsletterStatusEnum.ACTIVE) {
    throw createError("You are already subscribed to our newsletter", ResponseCodeEnum.BAD_REQUEST);
  }

  return { subscriber: await getSubscriber(existing.id), created: false };
}

async function getSubscribers(query: INewsletterQuery) {
  const { page = 1, status, search } = query;

  const where: { [key: string]: unknown } = {};
  if (status && status !== "all") where.status = status;
  if (search) where.email = ILike(`%${search}%`);

  const [records, total] = await ABSTRACT_SERVICE.findPaginatedRecords(NewsletterSubscriber, Number(page) || 1, {
    where,
    order: { createdAt: "DESC" },
  });

  const activeTotal = await AppDataSource.getRepository(NewsletterSubscriber).count({
    where: { status: NewsletterStatusEnum.ACTIVE },
  });

  return {
    records,
    activeTotal,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: PAGINATION,
      totalPages: Math.ceil(total / PAGINATION),
    },
  };
}

async function getSubscriber(id: number) {
  const subscriber = await ABSTRACT_SERVICE.getUniqueData(NewsletterSubscriber, { id });
  if (!subscriber) {
    throw createError("Subscriber not found", 404);
  }
  return subscriber as NewsletterSubscriber;
}

async function updateSubscriberStatus({ id, status }: IUpdateSubscriberStatus) {
  await getSubscriber(id);
  await ABSTRACT_SERVICE.updateById(NewsletterSubscriber, id, { status, statusUpdatedAt: new Date() });
  return await getSubscriber(id);
}

async function sendBroadcast({ subject, message, subscriberIds }: INewsletterBroadcast) {
  const targeted = Boolean(subscriberIds?.length);

  const recipients = await AppDataSource.getRepository(NewsletterSubscriber).find({
    where: {
      status: NewsletterStatusEnum.ACTIVE,
      ...(targeted ? { id: In(subscriberIds!) } : {}),
    },
    select: { id: true, email: true },
    order: { id: "ASC" },
  });

  if (!recipients.length) {
    throw createError(
      targeted ? "None of the selected subscribers are active" : "There are no active subscribers",
      400,
    );
  }

  const body = marked.parse(message, { async: false, breaks: true }) as string;
  const html = (await ejs.renderFile(templatePath("newsletter-broadcast.ejs"), {
    subject,
    body,
    unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
  })) as string;
  const text = `${message}\n\n---\nUnsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`;

  if (nodeEnv === Environments.PRODUCTION) {
    for (let i = 0; i < recipients.length; i += BROADCAST_BATCH_SIZE) {
      const batch = recipients.slice(i, i + BROADCAST_BATCH_SIZE);
      await BroadcastEmailService.sendBulkMail({
        receiverEmail: batch.map((recipient) => recipient.email),
        subject,
        text,
        html,
        // Mailgun fills %recipient.*% per address and sends each recipient their own copy.
        recipientVariables: Object.fromEntries(
          batch.map((recipient) => [
            recipient.email,
            { id: recipient.id, unsubscribeUrl: unsubscribeUrl(recipient.id, recipient.email) },
          ]),
        ),
      });
    }
  } else {
    // Outside production emails go out one at a time, so fill in each unsubscribe link here.
    for (const recipient of recipients) {
      const link = unsubscribeUrl(recipient.id, recipient.email);
      await BroadcastEmailService.sendBulkMail({
        receiverEmail: recipient.email,
        subject,
        text: text.split(UNSUBSCRIBE_PLACEHOLDER).join(link),
        html: html.split(UNSUBSCRIBE_PLACEHOLDER).join(link),
      });
    }
  }

  return {
    sent: recipients.length,
    skipped: targeted ? subscriberIds!.length - recipients.length : 0,
  };
}

async function unsubscribe(token: string) {
  const parsed = parseUnsubscribeToken(token);
  if (!parsed) throw createError("This unsubscribe link is invalid", 400);

  const subscriber = (await ABSTRACT_SERVICE.getUniqueData(NewsletterSubscriber, {
    id: parsed.id,
  })) as NewsletterSubscriber | null;
  if (!subscriber || !isValidUnsubscribeSignature(subscriber.id, subscriber.email, parsed.signature)) {
    throw createError("This unsubscribe link is invalid", 400);
  }

  if (subscriber.status !== NewsletterStatusEnum.INACTIVE) {
    await ABSTRACT_SERVICE.updateById(NewsletterSubscriber, subscriber.id, {
      status: NewsletterStatusEnum.INACTIVE,
      statusUpdatedAt: new Date(),
    });
  }

  return subscriber;
}

const NewsletterService = {
  subscribe,
  getSubscribers,
  getSubscriber,
  updateSubscriberStatus,
  sendBroadcast,
  unsubscribe,
};

export default NewsletterService;
