import { NextFunction, Request, Response } from "express";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import UploadFields from "./upload.fields";

function singleFileUploadHandler(req: Request, res: Response, next: NextFunction) {
  UploadFields.singleFileUpload(req, res, async (err) => {
    if (!req.file) {
      return next();
    }

    if (err) {
      Logger.error(err || err.message);
      return res.status(500).json({ status: "Failed", message: err?.message || "Failed to upload file" });
    }

    return next();
  });
}

function multiFileUploadHandler(req: Request, res: Response, next: NextFunction) {
  UploadFields.multiFileUpload(req, res, async (err) => {
    if (!req.files) {
      return res.status(ResponseCodeEnum.BAD_REQUEST).json({
        status: "Failed",
        message: "No file uploaded",
        data: null,
      });
    }

    if (err) {
      Logger.error(err || err?.message || "Error uploading files");
      return res.status(500).json({ status: "Failed", message: err?.message || "Failed to upload files" });
    }

    return next();
  });
}

function designFilesUploadHandler(req: Request, res: Response, next: NextFunction) {
  UploadFields.designFilesUpload(req, res, async (err) => {
    if (err) {
      Logger.error(err?.message || err || "Error uploading files");
      return res.status(500).json({ status: "Failed", message: err?.message || "Failed to upload files" });
    }

    return next();
  });
}

const UploadHandler = {
  singleFileUploadHandler,
  multiFileUploadHandler,
  designFilesUploadHandler,
};

export default UploadHandler;
