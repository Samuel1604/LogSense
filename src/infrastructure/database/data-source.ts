import "reflect-metadata";

import { DataSource } from "typeorm";

import { env } from "../../config/env.js";

import { AnalysisEntity } from "../../modules/analyses/entities/analysis.entity.js";
import {  CreateAnalysesTable1794404989916 } from "./migrations/1794404989916-CreateAnalysesTable.js";
import { AddStoragePathToAnalysesTable1794404989917 } from "./migrations/1794404989917-AddStoragePathToAnalysesTable.js";

export const AppDataSource = new DataSource({
  type: "postgres",

  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,

  ssl: env.DATABASE_SSL,

  synchronize: false,
  migrationsRun: false,

  entities: [AnalysisEntity],
  migrations: [
    CreateAnalysesTable1794404989916,
    AddStoragePathToAnalysesTable1794404989917,
  ],

  logging: false,
});