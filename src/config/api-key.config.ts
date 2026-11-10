import { NextFunction, Request, Response } from "express";
import { API_KEY } from "./env";

export const validateKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const appKey = API_KEY;

  if (!apiKey || apiKey !== appKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export const validateAdminKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.get("x-internal-use")?.trim();
  const validKey = process.env.INTERNAL_USE_KEY;

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing API key." });
  }

  return next();
};

export const dynamicKeySelector = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const appKey = API_KEY;
  const internalUseHeader = req.get("x-internal-use")?.trim();
  const validKey = process.env.INTERNAL_USE_KEY;

  if (apiKey && apiKey === appKey) {
    return next();
  }

  if (internalUseHeader && internalUseHeader === validKey) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized: Invalid or missing API key." });
};
