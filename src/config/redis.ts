import Queue from "bull";
import { Environments } from "../enums/env.enum";
import { nodeEnv, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./env";
import Logger from "../utils/logger";

const isLocal = nodeEnv === Environments.LOCAL;

function getRedisConnection() {
  const connection = {
    host: REDIS_HOST,
    port: Number(REDIS_PORT) || 6379,
    ...(isLocal ? {} : { password: REDIS_PASSWORD }),
  };

  console.info("Redis connection config:", {
    host: connection.host,
    port: connection.port,
    hasPassword: !!connection.password,
    isLocal,
    nodeEnv,
  });

  return connection;
}

const redisConnection = getRedisConnection();

const queueOptions = {
  redis: redisConnection,
};

export const userCreationQueue = new Queue("user-creation", queueOptions);
export const addDepartmentUsersQueue = new Queue("dept-users", queueOptions);

const subscribeToQueues = () => {
  [userCreationQueue, addDepartmentUsersQueue].forEach((queue) => {
    queue.on("completed", (job) => {
      Logger.info(`Job completed in ${queue.name}:`, job.id);
    });

    queue.on("error", (error) => {
      Logger.error(`Queue error for ${queue.name}:`, error);
    });

    queue.on("failed", (job, err) => {
      Logger.error("Job failed in", queue.name, job.id, err);
    });
  });
};

try {
  Logger.info("Checking redis connection...");
  if (!isLocal) subscribeToQueues();
} catch (error) {
  Logger.error("Error connecting to Redis:", error);
}
