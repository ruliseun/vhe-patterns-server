import dotenv from "dotenv";
import { IEnv } from "../interface/environment.interface";
import Logger from "../utils/logger";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV;

// APP URL
export const baseApiURL = process.env.BASE_API_URL;

// DATABASE
export const databaseURL = process.env.DATABASE_URL;
export const databaseName = process.env.DATABASE_NAME;
export const databaseUser = process.env.DATABASE_USER;
export const databasePassword = process.env.DATABASE_PASSWORD;
export const databasePort = process.env.DATABASE_PORT;
export const databaseHost = process.env.DATABASE_HOST;
export const localDatabaseUserName = process.env.LOCAL_DATABASE_NAME;
export const localDatabasePassword = process.env.LOCAL_DATABASE_PASSWORD;

// API KEY
export const API_KEY = process.env.API_KEY;

// EMAIL
export const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

// AUTHENTICATION
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = process.env.AUTH_REFRESH_TOKEN_EXPIRY;

//STORAGE
export const fileUploadUrl = process.env.FILE_UPLOAD_URL;

// FRONTEND
export const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

// SWAGGER
export const { SWAGGER_USER, SWAGGER_PASS } = process.env;

export const TOKENS = {
  auth_token_secret: AUTH_TOKEN_SECRET,
  access_token_expiry: ACCESS_TOKEN_EXPIRY,
  refresh_token_expiry: REFRESH_TOKEN_EXPIRY,
};

// REDIS
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

export const maxFileRowLimit = process.env.MAX_CSV_ROW || 100;

// CLOUDINARY
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Log Redis configuration at startup
Logger.info("🔍 Redis Environment Variables:");
Logger.info(`   REDIS_HOST: ${REDIS_HOST || "NOT SET"}`);
Logger.info(`   REDIS_PORT: ${REDIS_PORT || "NOT SET"}`);
Logger.info(`   REDIS_PASSWORD: ${REDIS_PASSWORD ? "SET" : "NOT SET"}`);
Logger.info(`   NODE_ENV: ${nodeEnv}` + "\n");

(() => {
  const requiredEnvs: IEnv = {
    nodeEnv,
    databaseURL,
    databaseName,
    databaseHost,
    databaseUser,
    databasePassword,
    databasePort,
    baseApiURL,
    API_KEY,
    AUTH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    MAILGUN_API_KEY,
    MAILGUN_DOMAIN,
    frontendBaseUrl,
    fileUploadUrl,
    SWAGGER_USER,
    SWAGGER_PASS,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
  };

  const missing = Object.keys(requiredEnvs)
    .map((variable) => {
      if (!requiredEnvs[variable as keyof typeof requiredEnvs]) return variable;
      return "";
    })
    .filter((val) => val.length);

  if (missing.length) {
    console.error("[MISSING ENV VARIABLES]:\n", missing);
  }
})();
