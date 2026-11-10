import { Request } from "express";
import multer from "multer";
import { nodeEnv } from "../../config/env";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { Environments } from "../../enums/env.enum";

const bucket = "BUCKET_NAME";
const s3 = new S3Client({
  endpoint: "DIGITAL_OCEAN_KEY_NAME",
  region: "us-east-1",
  credentials: {
    accessKeyId: "ACCESS_KEY_ID"!,
    secretAccessKey: "DIGITAL_OCEAN_SECRET_KEY"!,
  },
});
const environment = nodeEnv === Environments.PRODUCTION ? "prod" : "dev";

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

export const upload = (fieldName: string) =>
  multer({
    fileFilter: filterMixFile,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mb
    storage: multerS3({
      s3,
      bucket,
      acl: "public-read",
      metadata: (_reqst, _file: Express.Multer.File, cb) => {
        cb(null, { fieldName });
      },
      key: (_request, file: Express.Multer.File, cb) => {
        cb(null, `${environment}/${fieldName}/${Date.now()}-${file.originalname}`);
      },
    }),
  });

export const uploadFile = (fieldName: string) =>
  multer({
    fileFilter: filterMixFile,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mb
    storage: multerS3({
      s3,
      bucket,
      acl: "public-read",
      metadata: (_reqst, _file: Express.Multer.File, cb) => {
        cb(null, { fieldName });
      },
      key: (_request, file: Express.Multer.File, cb) => {
        cb(null, `${environment}/${fieldName}/${Date.now()}-${file.originalname}`);
      },
    }),
  }).single(fieldName);

export const uploadFileArray = (fieldName: string) =>
  multer({
    fileFilter: filterMixFile,
    limits: { fileSize: 10000000 }, // 10 Mb
    storage: multerS3({
      s3,
      bucket,
      acl: "public-read",
      metadata: (_reqst, _file: Express.Multer.File, cb) => {
        cb(null, { fieldName });
      },
      key: (_request, file: Express.Multer.File, cb) => {
        cb(null, `${environment}/${fieldName}/${Date.now()}-${file.originalname}`);
      },
    }),
  });

const UploadConfig = { uploadFile, uploadFileArray };
export default UploadConfig;
