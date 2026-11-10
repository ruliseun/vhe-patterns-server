import { Request, Response } from "express";
import Logger from "../utils/logger";

export const healthCheck = async (_req: Request, res: Response) => {
  Logger.info("VhePatterns Server is starting");
  res.status(200).json({ message: "VhePatterns Server is up and running" });
};
