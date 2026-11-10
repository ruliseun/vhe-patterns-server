import FormData from "form-data";
import { MAILGUN_API_KEY, MAILGUN_DOMAIN, nodeEnv } from "../../config/env";
import Logger from "../../utils/logger";
import { httpClient } from "../http.service";
import { Environments } from "../../enums/env.enum";
import EmailService from "./email.service";

interface ISendEmail {
  receiverEmail: string | string[];
  subject: string;
  text?: string;
  html?: string;
  hasAttachment?: boolean;
  attachmentFile?: Buffer | NodeJS.ReadableStream | string;
  filename?: string;
  sender?: string;
  senderName?: string;
  contentType?: string;
  recipientVariables?: Record<string, any>;
}

const mailgunApiKey = MAILGUN_API_KEY!;
const mailgunDomain = MAILGUN_DOMAIN!;
const senderMail = "support@vhepatterns.com";

/* eslint-disable complexity */
export async function sendBulkMail({
  receiverEmail,
  subject,
  text,
  html,
  hasAttachment = false,
  attachmentFile,
  filename,
  sender,
  senderName,
  contentType = "application/pdf",
  recipientVariables,
}: ISendEmail) {
  if (!mailgunApiKey || !mailgunDomain) {
    Logger.error("Mailgun API key or domain is not set.");
    return;
  }

  const isTestMode = nodeEnv !== Environments.PRODUCTION;

  if (isTestMode) {
    let target = [];
    if (Array.isArray(receiverEmail) && receiverEmail.length) {
      target = [...receiverEmail];
    } else {
      target = [receiverEmail];
    }
    Promise.all([
      target.map((r) => {
        EmailService.sendMail({
          receiverEmail: r as string,
          subject,
          text: text!,
          html: html!,
          sender,
          senderName,
        });
      }),
    ]);
    return;
  }

  const apiUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;
  const form = new FormData();

  let toList;

  if (Array.isArray(receiverEmail)) {
    const filteredEmails = receiverEmail
      .map((email) => {
        const mail = email;
        if (!mail) {
          Logger.error(`Invalid email address: ${email}`);
        }
        return mail;
      })
      .filter((email) => email !== null) as string[];
    toList = filteredEmails.join(", ");
  } else {
    const mail = receiverEmail;
    if (!mail) {
      Logger.error(`Invalid email address: ${receiverEmail}`);
      return;
    }
    toList = mail;
  }

  form.append("from", sender && senderName ? `${senderName} <${sender}>` : `VhePatterns <${senderMail}>`);
  form.append("to", toList);
  form.append("subject", subject);

  if (text) form.append("text", text);
  if (html) form.append("html", html);

  if (recipientVariables) {
    form.append("recipient-variables", JSON.stringify(recipientVariables));
  }

  if (hasAttachment && attachmentFile && filename) {
    form.append("attachment", attachmentFile, {
      filename,
      contentType,
    });
  }

  try {
    const data = await httpClient({
      url: apiUrl,
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`api:${mailgunApiKey}`).toString("base64"),
        contentType: "multipart/form-data",
      },
      payload: form as any,
    });

    if (data.error) {
      Logger.error(`Mailgun API error: ${data.message}`);
      throw new Error(data.message);
    }

    if (data.status == 200) {
      Logger.info("Email successfully sent ::: recipients ", toList);
      Logger.info("Job ID :::: ", data?.data?.id);
    } else {
      Logger.error(`Mailgun API error: ${data?.message}`);
      throw new Error(data.message);
    }

    return;
  } catch (ex) {
    Logger.error("Error sending broadcast email:", ex);
    throw ex;
  }
}

const BroadcastEmailService = { sendBulkMail };

export default BroadcastEmailService;
