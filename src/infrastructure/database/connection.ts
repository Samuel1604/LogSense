import { AppDataSource } from "./data-source.js";
import { logger } from "../logger.js";

export const connectDatabase = async (): Promise<void> => {
    if (AppDataSource.isInitialized) {
        return;
    }

    await AppDataSource.initialize();

    logger.info("PostgreSQL database connection established successfully");
};

export const isDatabaseReady = async (): Promise<boolean> => {
    if (!AppDataSource.isInitialized) {
        return false;
    }

    try {
        await AppDataSource.query("SELECT 1");
        return true;
    } catch {
        return false;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    if (!AppDataSource.isInitialized) {
        return;
    }

    await AppDataSource.destroy();

    logger.info("PostgreSQL database connection closed successfully");
};