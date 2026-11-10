import { Request } from "express";
import multer from "multer";
import FormData from "form-data";
import streamifier from "streamifier";
import { httpClient } from "../../service/http.service";
import Logger from "../../utils/logger";
import { fileUploadUrl } from "../../config/env";

const filterMixFile = (_req: Request, file: Express.Multer.File, cb: (error: any, mime?: boolean) => void) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "text/csv"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG, PNG and PDF are allowed!"), false);
  }
};

export const upload = () =>
  multer({
    fileFilter: filterMixFile,
    storage: multer.memoryStorage(),
    limits: { fileSize: 10000000 }, // 10mb
  });

const uploadFile = async (file: Express.Multer.File) => {
  try {
    const formData = new FormData();

    const stream = streamifier.createReadStream(file.buffer);
    formData.append("file", stream, file.originalname);

    const response = await httpClient({
      url: `${fileUploadUrl}/upload`,
      method: "POST",
      headers: {
        ...formData.getHeaders(),
      },
      payload: formData as any,
    });

    if (!response.status) {
      return { status: false, message: "Error uploading file" };
    }

    return { status: true, location: response.data?.fileDetails?.filePath };
  } catch (error) {
    console.error("Error uploading file", error);
    Logger.error("Error uploading file");
    return { status: false, message: "Error uploading file" };
  }
};

const uploadFileArray = async (files: any) => {
  const uploadedFiles = [];
  for (const file of files) {
    const result = await uploadFile(file);
    if (result.status) {
      uploadedFiles.push(result.location);
    }
  }
  return { status: true, location: uploadedFiles };
};

const uploadFileFields = async (files: any) => {
  let uploadedFiles = {};

  for (const key in files) {
    const file = files[key];
    const result = await uploadFile(file[0]);
    if (result.status) {
      uploadedFiles = { ...uploadedFiles, [file[0].fieldname]: result.location };
    }
  }

  return { status: true, location: uploadedFiles };
};

const UploadConfig = { uploadFile, uploadFileArray, uploadFileFields };
export default UploadConfig;
