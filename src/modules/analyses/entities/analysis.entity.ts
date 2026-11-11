import { EntitySchema } from "typeorm";

export type AnalysisStatus =
    | "queued"
    | "processing"
    | "cancelling"
    | "completed"
    | "partial"
    | "failed"
    | "cancelled"


export class Analysis {
    id!: string;

    filename!: string;

    fileSize!: number;

    storagePath!: string | null;

    status!: AnalysisStatus;

    totalLines!: number;

    parsedLines!: number;

    unparsedLines!: number;

    totalErrors!: number;

    totalBatches!: number;

    completedBatches!: number;

    failedBatches!: number;

    currentStage!: string | null;

    failureCode!: string | null;

    cancellationRequestedAt!: Date | null;

    createdAt!: Date;

    startedAt!: Date | null;

    completedAt!: Date | null;

    cancelledAt!: Date | null;
}

export const AnalysisEntity = new EntitySchema<Analysis>({
  name: "Analysis",
  target: Analysis,
  tableName: "analyses",

  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },

    filename: {
      type: "text",
    },

    fileSize: {
      type: "integer",
      name: "file_size",
    },

    storagePath: {
      type: "text",
      name: "storage_path",
      nullable: true,
    },

    status: {
      type: "varchar",
      length: 20,
      default: "queued",
    },

    totalLines: {
      type: "integer",
      name: "total_lines",
      default: 0,
    },

    parsedLines: {
      type: "integer",
      name: "parsed_lines",
      default: 0,
    },

    unparsedLines: {
      type: "integer",
      name: "unparsed_lines",
      default: 0,
    },

    totalErrors: {
      type: "integer",
      name: "total_errors",
      default: 0,
    },

    totalBatches: {
      type: "integer",
      name: "total_batches",
      default: 0,
    },

    completedBatches: {
      type: "integer",
      name: "completed_batches",
      default: 0,
    },

    failedBatches: {
      type: "integer",
      name: "failed_batches",
      default: 0,
    },

    currentStage: {
      type: "varchar",
      length: 50,
      name: "current_stage",
      nullable: true,
    },

    failureCode: {
      type: "varchar",
      length: 100,
      name: "failure_code",
      nullable: true,
    },

    cancellationRequestedAt: {
      type: "timestamptz",
      name: "cancellation_requested_at",
      nullable: true,
    },

    createdAt: {
      type: "timestamptz",
      name: "created_at",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },

    startedAt: {
      type: "timestamptz",
      name: "started_at",
      nullable: true,
    },

    completedAt: {
      type: "timestamptz",
      name: "completed_at",
      nullable: true,
    },

    cancelledAt: {
      type: "timestamptz",
      name: "cancelled_at",
      nullable: true,
    },
  },
});