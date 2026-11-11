import { AppDataSource } from "./data-source.js";
import { logger } from "../logger.js";

const runMigrations = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();

    logger.info("Database connection established for migrations");

    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      logger.info("Database schema is already up to date");
      return;
    }

    for (const migration of migrations) {
      logger.info(
        { migration: migration.name },
        "Database migration executed successfully",
      );
    }

    logger.info(
      { count: migrations.length },
      "Database migrations completed successfully",
    );
  } catch (error) {
    logger.error({ err: error }, "Database migration failed");

    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

void runMigrations();