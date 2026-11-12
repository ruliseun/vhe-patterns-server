import { NewsletterStatusEnum } from "../enums/newsletter.enum";

export interface ISubscribeNewsletter {
  email: string;
}

export interface INewsletterQuery {
  page?: number | string;
  status?: NewsletterStatusEnum | "all";
  search?: string;
}

export interface IUpdateSubscriberStatus {
  id: number;
  status: NewsletterStatusEnum;
}

export interface INewsletterBroadcast {
  subject: string;
  message: string;
  subscriberIds?: number[];
}
