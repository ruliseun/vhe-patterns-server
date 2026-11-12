import { Request } from "express";
import multer from "multer";
import streamifier from "streamifier";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../../config/env";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export const initializeCloudinary = () =>
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

const filterMixFile = (_req: Request, file: Express.Multer.File, cb: (error: any, mime?: boolean) => void) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG are allowed!"), false);
  }
};

export const upload = () =>
  multer({
    fileFilter: filterMixFile,
    storage: multer.memoryStorage(),
    limits: { fileSize: 10000000 }, // 10mb
  });

interface IUploadOptions {
  crop?: boolean;
}

const uploadFile = async (file: Express.Multer.File, { crop = true }: IUploadOptions = {}) => {
  try {
    const fileUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: "vhe-patterns" }, (error, result) => {
        if (error || !result) {
          reject(error || new Error("Error uploading file"));
        } else {
          resolve(result);
        }
      });

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    const url = cloudinary.url(fileUpload.public_id, {
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
        crop
          ? {
              height: 1200,
              width: 1200,
              crop: "fill",
              gravity: "auto",
            }
          : {
              width: 1600,
              crop: "limit",
            },
      ],
    });

    if (!url) {
      return { status: false, message: "Error uploading file" };
    }

    return { status: true, location: url, fileName: file.originalname };
  } catch (error) {
    console.error("Error uploading file", error);
    return { status: false, message: error?.message || "Error uploading file" };
  }
};

const uploadFileArray = async (files: any, options?: IUploadOptions) => {
  const uploadedFiles = [];
  for (const file of files) {
    const result = await uploadFile(file, options);
    if (result.status) {
      uploadedFiles.push({ location: result.location, fileName: result.fileName });
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
      uploadedFiles = {
        ...uploadedFiles,
        [file[0].fieldname]: { location: result.location, fileName: result.fileName },
      };
    }
  }

  return { status: true, location: uploadedFiles };
};

const UploadConfig = { uploadFile, uploadFileArray, uploadFileFields };
export default UploadConfig;
