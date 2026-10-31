# LogSense — System Design

**Version:** 1.0
**Status:** Approved

## 1. Architecture Overview

LogSense will use a **modular monolith architecture** with a separate API process and background worker.

The application will combine deterministic log-processing operations with LLM-assisted reasoning.

The backend will be responsible for:

* File validation and temporary storage.
* Log parsing and normalization.
* Sensitive-data redaction.
* Error grouping and context extraction.
* Background job orchestration.
* AI provider communication.
* Response validation.
* Result aggregation and persistence.

## 2. Technology Stack

| Component         | Technology              |
| ----------------- | ----------------------- |
| Runtime           | Node.js                 |
| Language          | TypeScript              |
| HTTP framework    | Express                 |
| Database          | PostgreSQL              |
| ORM               | TypeORM                 |
| Database driver   | pg                      |
| Job queue         | BullMQ                  |
| Queue storage     | Redis                   |
| AI provider       | Groq                    |
| Initial AI model  | openai/gpt-oss-20b      |
| Validation        | Zod                     |
| Logging           | Pino                    |
| Testing           | Vitest                  |
| API documentation | OpenAPI                 |
| File storage      | Local temporary storage |

## 3. High-Level Architecture

```text
                 CLIENT
                   |
                   v
              EXPRESS API
                   |
             File Validation
                   |
             Temporary Storage
                   |
                   v
              BULLMQ QUEUE
                   |
                   v
             BACKGROUND WORKER
                   |
             Log Processing
                   |
          +--------+--------+
          |        |        |
       Redaction Parsing Grouping
          |        |        |
          +--------+--------+
                   |
            Context Extraction
                   |
                   v
              AI ANALYSIS
                   |
           Response Validation
                   |
           Result Aggregation
                   |
                   v
              POSTGRESQL
                   |
                   v
                CLIENT
```

Redis supports job coordination through BullMQ. PostgreSQL remains the source of truth for application records and analysis results.

## 4. Analysis Lifecycle

An analysis follows these states:

```text
queued
  |
  v
processing
  |
  +------> completed
  |
  +------> partial
  |
  +------> failed
  |
  +------> cancelling
               |
               v
           cancelled
```

* `queued`: Accepted and waiting for processing.
* `processing`: Worker is processing the file.
* `cancelling`: Cancellation has been requested.
* `completed`: All required processing succeeded.
* `partial`: Some processing succeeded, but some batches failed.
* `failed`: The analysis could not produce a usable result.
* `cancelled`: Processing was stopped following a cancellation request.

Terminal states are `completed`, `partial`, `failed`, and `cancelled`.

## 5. Request Lifecycle

1. Client submits a log file.
2. API validates the file and configured limits.
3. File is stored temporarily.
4. Analysis record is created.
5. A background job is queued.
6. API responds with HTTP `202 Accepted` and an analysis ID.
7. Worker retrieves the job.
8. File is streamed through the processing pipeline.
9. Sensitive values are redacted.
10. Entries are parsed, grouped, and normalized.
11. Relevant context is extracted.
12. Log data is divided into bounded batches.
13. Batches are submitted for AI analysis.
14. AI responses are validated.
15. Results are aggregated.
16. Final report and processing metadata are persisted.
17. Temporary files are cleaned up.

## 6. Log Processing Strategy

Log processing is deterministic wherever possible.

The processing pipeline will:

* Read files incrementally.
* Identify timestamps and severity levels where possible.
* Associate multiline stack traces with their originating entries.
* Preserve unrecognized lines.
* Redact sensitive values.
* Generate stable error fingerprints.
* Group repeated errors.
* Extract representative examples and surrounding context.

The application must not silently discard unrecognized log entries.

## 7. AI Analysis Strategy

AI is used for tasks requiring probabilistic reasoning:

* Explaining unfamiliar errors.
* Suggesting possible causes.
* Identifying patterns.
* Recommending debugging steps.
* Identifying potential relationships between different error groups.

AI is not responsible for basic parsing, counting, redaction, or deterministic grouping.

### Batch Analysis

Large files are divided into bounded batches.

Each batch is analyzed independently.

A subsequent aggregation stage combines validated findings and investigates relationships across batches.

Cross-batch analysis should be used only when necessary.

AI findings must include supporting evidence and clearly distinguish facts from hypotheses.

## 8. Background Processing

BullMQ manages asynchronous analysis jobs.

The API and worker operate as separate processes.

The API accepts requests and provides analysis status.

The worker performs expensive processing without blocking HTTP requests.

Initial concurrency limits:

* One active analysis.
* One concurrent AI request.
* Two maximum retries per AI batch.

Job processing must be idempotent where possible.

## 9. Data Persistence

PostgreSQL stores four primary entities:

1. `analyses` — analysis lifecycle and metadata.
2. `error_groups` — grouped and sanitized errors.
3. `ai_batch_runs` — individual AI batch execution records.
4. `analysis_reports` — final structured analysis.

Original sensitive log contents should not be persisted unnecessarily.

Temporary uploaded files must be cleaned up after processing.

## 10. Security Boundaries

* Uploaded files are untrusted input.
* Validate file types and sizes.
* Redact sensitive information before external AI requests.
* Keep provider credentials in environment variables.
* Treat log contents as data, never as instructions.
* Never allow AI to execute shell commands or modify files.
* Avoid logging sensitive log contents.
* Bind the unauthenticated local application to localhost.

## 11. Failure Handling

The application must handle:

* Invalid uploads.
* Malformed log entries.
* Temporary storage failures.
* Database connection failures.
* Redis connection failures.
* AI provider timeouts.
* Rate limits.
* Provider server errors.
* Invalid AI responses.
* Worker crashes.
* Cancellation requests.

Retries must be selective rather than indiscriminate.

Some failures should terminate immediately, while recoverable failures may be retried with controlled backoff.

## 12. Initial API Design

| Method | Endpoint                       | Purpose                      |
| ------ | ------------------------------ | ---------------------------- |
| POST   | `/api/v1/analyses`             | Upload and queue analysis    |
| GET    | `/api/v1/analyses/:id`         | Retrieve status and progress |
| GET    | `/api/v1/analyses/:id/results` | Retrieve final report        |
| POST   | `/api/v1/analyses/:id/cancel`  | Cancel analysis              |
| DELETE | `/api/v1/analyses/:id`         | Delete terminal analysis     |
| GET    | `/health`                      | Process health               |
| GET    | `/ready`                       | Dependency readiness         |

Uploads return `202 Accepted`, because processing happens asynchronously.

## 13. Initial Deployment Model

The first version is a local, single-user application.

The API and worker run locally.

PostgreSQL and Redis provide persistence and job coordination.

No public deployment or multi-user authentication is required for the initial MVP.
