import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnalysesTable1794404989916 implements MigrationInterface {
  name = "CreateAnalysesTable1794404989916";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "analyses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),

        "filename" text NOT NULL,
        "file_size" integer NOT NULL,

        "status" character varying(20) NOT NULL DEFAULT 'queued',

        "total_lines" integer NOT NULL DEFAULT 0,
        "parsed_lines" integer NOT NULL DEFAULT 0,
        "unparsed_lines" integer NOT NULL DEFAULT 0,

        "total_errors" integer NOT NULL DEFAULT 0,

        "total_batches" integer NOT NULL DEFAULT 0,
        "completed_batches" integer NOT NULL DEFAULT 0,
        "failed_batches" integer NOT NULL DEFAULT 0,

        "current_stage" character varying(50),
        "failure_code" character varying(100),

        "cancellation_requested_at" TIMESTAMPTZ,

        "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "started_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        "cancelled_at" TIMESTAMPTZ,

        CONSTRAINT "PK_91421900ca225ed9865d016a940"
          PRIMARY KEY ("id"),

        CONSTRAINT "CHK_analyses_file_size"
          CHECK ("file_size" >= 0),

        CONSTRAINT "CHK_analyses_status"
          CHECK (
            "status" IN (
              'queued',
              'processing',
              'cancelling',
              'completed',
              'partial',
              'failed',
              'cancelled'
            )
          ),

        CONSTRAINT "CHK_analyses_total_lines"
          CHECK ("total_lines" >= 0),

        CONSTRAINT "CHK_analyses_parsed_lines"
          CHECK ("parsed_lines" >= 0),

        CONSTRAINT "CHK_analyses_unparsed_lines"
          CHECK ("unparsed_lines" >= 0),

        CONSTRAINT "CHK_analyses_total_errors"
          CHECK ("total_errors" >= 0),

        CONSTRAINT "CHK_analyses_total_batches"
          CHECK ("total_batches" >= 0),

        CONSTRAINT "CHK_analyses_completed_batches"
          CHECK ("completed_batches" >= 0),

        CONSTRAINT "CHK_analyses_failed_batches"
          CHECK ("failed_batches" >= 0),

        CONSTRAINT "CHK_analyses_batch_counts"
          CHECK (
            "completed_batches" + "failed_batches"
            <= "total_batches"
          )
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_analyses_status"
      ON "analyses" ("status");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_analyses_created_at"
      ON "analyses" ("created_at" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "analyses";
    `);
  }
}
