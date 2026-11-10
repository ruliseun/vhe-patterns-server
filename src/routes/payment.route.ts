import { Router } from "express";
import { appRoot } from "../app";
import ejs from "ejs";
import Logger from "../utils/logger";

const router = Router();

router.get("/success", async (_req, res) => {
  try {
    const subscriptionSuccess = "/templates/pages/payment-success.ejs";
    const successPage = await ejs.renderFile(`${appRoot}${subscriptionSuccess}`);
    return res.send(successPage);
  } catch (error) {
    console.error("Error loading template page", error);
    Logger.error("Error loading template page");
  }
});

router.get("/failed", async (_req, res) => {
  try {
    const subscriptionSuccess = "/templates/pages/payment-failed.ejs";
    const failurePage = await ejs.renderFile(`${appRoot}${subscriptionSuccess}`);
    return res.send(failurePage);
  } catch (error) {
    console.error("Error loading template page", error);
    Logger.error("Error loading template page");
  }
});

export default router;
