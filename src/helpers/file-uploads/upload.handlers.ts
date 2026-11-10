import { NextFunction, Request, Response } from "express";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import UploadFields from "./upload.fields";

function profilePhotoUploader(req: Request, res: Response, next: NextFunction) {
  UploadFields.displayPictureUploadHandler(req, res, async (err) => {
    if (!req.file) {
      return next();
    }

    if (err) {
      Logger.error(err || err.message);
      return res.status(500).json({ status: "Failed", message: "Failed to upload file" });
    }

    return next();
  });
}

function filesUploadHandler(req: Request, res: Response, next: NextFunction) {
  UploadFields.fileUploadProxy(req, res, async (err) => {
    if (!req.files) {
      return res.status(ResponseCodeEnum.BAD_REQUEST).json({
        status: "Failed",
        message: "No file uploaded",
        data: null,
      });
    }

    if (err) {
      Logger.error(err || err?.message || "Error uploading files");
      return res.status(500).json({ status: "Failed", message: "Failed to upload file" });
    }

    return next();
  });
}

const UploadHandler = {
  profilePhotoUploader,
  filesUploadHandler,
};
export default UploadHandler;
