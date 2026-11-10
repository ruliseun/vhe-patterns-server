import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import "reflect-metadata";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config({ path: path.join(__dirname, "../.env") });
import { handleError } from "./helpers/error";
import httpLogger from "./middlewares/httpLogger";

export const appRoot = path.resolve();
import initializeRoutes from "./routes";
import { appVersion, getAppVersion } from "./config/constants";
import { connectDB } from "./config/database";
import { API_KEY, SWAGGER_USER, SWAGGER_PASS } from "./config/env";
import { swaggerDefinition } from "./config/swaggerDef";
import basicAuth from "express-basic-auth";
import { initializeCloudinary } from "./helpers/cloudinary-upload/uploads";

const app: express.Application = express();
const defaultApiKey = API_KEY;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
  }),
);

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());

initializeRoutes(app);

app.get("/vhepatterns/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ["./src/docs/*.yaml"],
});

app.use(
  "/vhepatterns/api-docs",
  basicAuth({
    challenge: true,
    users: { [SWAGGER_USER!]: SWAGGER_PASS! },
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      authAction: {
        BearerAuth: {
          name: "BearerAuth",
          schema: {
            type: "http",
            in: "header",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        ApiKeyAuth: {
          name: "ApiKeyAuth",
          schema: {
            type: "apiKey",
            in: "header",
            name: "x-api-key",
          },
          value: defaultApiKey,
        },
      },
    },
  }),
);

// catch 404 and forward to error handler
app.use((req, res) => {
  const method = req.method;
  res.status(404).json({
    status: "error",
    message: "Route Not Found",
    error: `Cannot ${method} ${req.url?.split(`api/${appVersion}`)[1] || ""}`,
  });
});

// error handler
const errorHandler: express.ErrorRequestHandler = (err, _req, res) => {
  handleError(err, res);
};
app.use(errorHandler);

const port = 3012;
app.set("port", port);

const server = http.createServer(app);

let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

async function onListening() {
  await connectDB();
  /*
  if (nodeEnv === Environments.DEVELOPMENT || nodeEnv === Environments.PRODUCTION) {
    let target = "";
    if (nodeEnv === Environments.PRODUCTION) target = "-prod";
    try {
      Logger.info("Running database migrations...");
      await AppDataSource.runMigrations();
      Logger.info("Database migrations completed");
      Logger.info("\n Running startup script processes...");
      await runRawCommand(`migration${target}:generate`);
      await runRawCommand(`migration${target}:run`);
      Logger.info("\n Startup script processes completed ✈️ \n");
    } catch (error) {
      Logger.error("Error running startup processes:", error);
    } 
  } */
  /* await connectAuditDB(); */
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Server is listening on ${bind}`);
  initializeCloudinary();
  getAppVersion();
}
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
