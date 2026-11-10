import { Environments } from "../enums/env.enum";
import { appVersion } from "./constants";
import { nodeEnv } from "./env";

let servers: { url: string; description: string }[] = [];

if (nodeEnv === Environments.LOCAL) {
  servers = [
    {
      url: `http://localhost:3012/vhepatterns/api/${appVersion}`,
      description: "Local Server",
    },
  ];
}

if (nodeEnv === Environments.DEVELOPMENT) {
  servers = [
    {
      url: `https://palmyst.dev.tech/vhepatterns/api/${appVersion}`,
      description: "Development Server",
    },
  ];
}

if (nodeEnv === Environments.PRODUCTION) {
  servers = [
    {
      url: `https://palmyst.prod.tech/vhepatterns/api/${appVersion}`,
      description: "Production Server",
    },
  ];
}

export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: `VhePatterns API ${appVersion}`,
    version: "1.0.0",
    description: "API documentation for VhePatterns backend system",
  },
  servers,
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
    {
      ApiKeyAuth: [],
    },
  ],
};
