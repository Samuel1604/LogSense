import { createApp } from "./app.js";
import { createContainer } from "./container.js";
import { AppDataSource } from "./infrastructure/database/data-source.js";

import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/connection.js";
import { logger } from "./infrastructure/logger.js";

const container = createContainer(AppDataSource);
const app = createApp(container);
let server: ReturnType<typeof app.listen>
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, env.HOST, () => {
      logger.info(
        { host: env.HOST, port: env.PORT },
        "LogSense server started",
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Application startup failed");

    await disconnectDatabase().catch((disconnectError) => {
      logger.error(
        { err: disconnectError },
        "Failed to close database connection after startup failure",
      );
    });

    process.exitCode = 1;
  }
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info({ signal }, "Shutdown signal received");

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      logger.info("HTTP server closed successfully");
    }

    await disconnectDatabase();

    logger.info("Application shutdown completed");
  } catch (error) {
    logger.error({ err: error }, "Error during application shutdown");
    process.exitCode = 1;
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});



void startServer();
