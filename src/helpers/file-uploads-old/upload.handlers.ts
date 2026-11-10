import { NextFunction, Request, Response } from "express";
import UploadConfig from "./uploads";
import Logger from "../../utils/logger";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import UploadFields from "./upload.fields";

function profilePhotoUploader(req: Request, res: Response, next: NextFunction) {
  UploadFields.displayPictureUploadHandler(req, res, async (err) => {
    if (!req.file) {
      return next();
    }

    const sendFile = await UploadConfig.uploadFile(req.file);

    if (err || !sendFile.status) {
      Logger.error(err || sendFile.message);
      return res.status(500).json({ status: "Failed", message: "Failed to upload file" });
    }

    (req as any).file.location = sendFile.location;

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

    const sendFile = await UploadConfig.uploadFileArray(req.files);

    if (err || !sendFile.status) {
      Logger.error("Error uploading files");
      return res.status(500).json({ status: "Failed", message: "Failed to upload file" });
    }

    (req as any).files.location = sendFile.location;

    return next();
  });
}

const UploadHandler = {
  profilePhotoUploader,
  filesUploadHandler,
};
export default UploadHandler;
