import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoragePathToAnalysesTable1794404989917 implements MigrationInterface {
  name = "AddStoragePathToAnalysesTable1794404989917";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "analyses"
      ADD COLUMN "storage_path" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "analyses"
      DROP COLUMN "storage_path"
    `);
  }
}
