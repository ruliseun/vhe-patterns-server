import puppeteer, { Browser, PDFOptions } from "puppeteer";
import { createError } from "./abstractService/abstractService";
import { ResponseCodeEnum } from "../enums/response-codes.enum";

type PdfOptions = {
  format?: PDFOptions["format"];
  printBackground?: boolean;
  margin?: PDFOptions["margin"];
};

let browserPromise: Promise<Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }
  return browserPromise;
}

async function close() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

async function getPdf(html: string, options: PdfOptions = {}) {
  if (!html) throw createError("Error creating PDF from file", ResponseCodeEnum.INTERNAL_SERVER_ERROR);
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfBuffer = await page.pdf({
    format: (options.format as any) ?? "A4",
    printBackground: options.printBackground ?? true,
    margin: options.margin,
  });

  await Promise.all([page.close(), close()]);

  return pdfBuffer;
}

export const PdfService = { getPdf };
