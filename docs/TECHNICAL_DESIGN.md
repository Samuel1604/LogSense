# LogSense — Technical Design

**Version:** 1.1
**Status:** Approved
**Architecture:** Modular Monolith
**Runtime:** Node.js + TypeScript

---

# 1. Technical Overview

LogSense is implemented as a modular monolith with two independently running processes:

- **API process:** Handles HTTP requests, validation, file uploads, and analysis retrieval.
- **Worker process:** Handles asynchronous log processing and AI analysis.

Both processes share the same application modules, database, and infrastructure.

The system uses deterministic processing for predictable operations and an LLM for probabilistic analysis.

## 1.1 Technology Stack

| Area                 | Technology         |
| -------------------- | ------------------ |
| Runtime              | Node.js 24         |
| Language             | TypeScript         |
| Package manager      | pnpm               |
| HTTP framework       | Express            |
| Database             | PostgreSQL         |
| ORM                  | TypeORM            |
| Database driver      | pg                 |
| Job queue            | BullMQ             |
| Queue infrastructure | Redis              |
| AI provider          | Groq               |
| Initial AI model     | openai/gpt-oss-20b |
| Runtime validation   | Zod                |
| Logging              | Pino               |
| Testing              | Vitest             |
| API documentation    | OpenAPI            |
| File uploads         | Multer             |
| Temporary storage    | Local filesystem   |

Dependencies and provider capabilities must be verified against their current documentation when implementation reaches the relevant stage.

---

# 2. Application Architecture

## 2.1 Architecture Style

The application follows a modular monolith architecture.

Each module owns a specific responsibility. Modules communicate through clearly defined interfaces rather than directly accessing one another's internal implementation.

The API and worker are separate processes, not separate microservices.

## 2.2 Proposed Project Structure

```text
logsense/
├── docs/
│   ├── PRD.md
│   ├── SYSTEM_DESIGN.md
│   ├── TECHNICAL_DESIGN.md
│   └── adr/
│
├── src/
│   ├── modules/
│   │   ├── analyses/
│   │   │   ├── analysis.controller.ts
│   │   │   ├── analysis.service.ts
│   │   │   ├── analysis.repository.ts
│   │   │   └── analysis.routes.ts
│   │   │
│   │   ├── logs/
│   │   │   ├── log-parser.service.ts
│   │   │   ├── log-redaction.service.ts
│   │   │   ├── log-grouping.service.ts
│   │   │   └── log.repository.ts
│   │   │
│   │   └── ai/
│   │       ├── ai-provider.interface.ts
│   │       ├── analysis.service.ts
│   │       ├── analysis.schema.ts
│   │       ├── response-validator.ts
│   │       └── providers/
│   │           └── groq.adapter.ts
│   │
│   ├── jobs/
│   │   ├── analysis.queue.ts
│   │   ├── analysis.worker.ts
│   │   └── analysis.processor.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── redis/
│   │   └── storage/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── config/
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── README.md
```

This is the intended module organization. Files will be introduced as their responsibilities become necessary rather than creating empty files in advance.

## 2.3 Module Responsibilities

### Analyses Module

Coordinates the analysis lifecycle.

Responsibilities:

- Accept analysis requests.
- Create and retrieve analysis records.
- Coordinate upload processing.
- Queue analysis jobs.
- Track analysis status and progress.
- Handle cancellation and deletion.

It must not contain log-parsing implementation or direct AI-provider logic.

### Logs Module

Owns deterministic log processing.

Responsibilities:

- Read log files incrementally.
- Parse supported formats.
- Normalize entries.
- Redact sensitive information.
- Group repeated errors.
- Extract relevant context.
- Persist sanitized error groups.

It must remain independent of the AI provider.

### AI Module

Owns communication with LLM providers.

Responsibilities:

- Define provider contracts.
- Submit bounded analysis requests.
- Construct analysis prompts.
- Validate structured responses.
- Normalize provider errors.
- Return validated analysis findings.

The analysis service must depend on an abstraction rather than directly on a provider SDK.

### Jobs Module

Coordinates background execution.

Responsibilities:

- Queue analysis jobs.
- Initialize workers.
- Retrieve jobs.
- Invoke the analysis processor.
- Handle retries and job failures.
- Respect cancellation requests.

### Infrastructure Module

Owns external technical dependencies.

Responsibilities:

- PostgreSQL connection.
- Redis connection.
- Temporary file storage.
- Infrastructure initialization and cleanup.

---

# 3. Application Design Principles

The implementation follows these principles:

1. Separation of concerns.
2. Single responsibility within modules.
3. Dependency inversion for external providers.
4. Repository pattern for persistence.
5. Service layer for business logic.
6. Explicit dependency injection.
7. Configuration through environment variables.
8. No premature abstractions.
9. No unnecessary complexity.
10. Test important behavior before shipping.

Controllers handle HTTP concerns. Services coordinate business operations. Repositories handle persistence.

Database queries must not be scattered throughout controllers and business services.

Manual dependency injection and a small application composition container will be used instead of introducing a dependency injection framework.

---

# 4. Database Design

PostgreSQL is the primary persistence layer.

TypeORM will use the Data Mapper pattern.

Entities represent persisted data, while repositories handle database operations. Business logic remains in services.

Automatic schema synchronization is disabled. Schema changes are managed through explicit migrations.

## 4.1 Analyses

Represents an individual log analysis request.

| Field                     | Purpose                                |
| ------------------------- | -------------------------------------- |
| id                        | Unique analysis identifier             |
| filename                  | Original filename as metadata          |
| file_size                 | Uploaded file size                     |
| status                    | Current lifecycle state                |
| total_lines               | Number of lines encountered            |
| parsed_lines              | Successfully parsed lines              |
| unparsed_lines            | Lines not recognized                   |
| total_errors              | Number of identified error occurrences |
| total_batches             | Number of AI batches                   |
| completed_batches         | Successfully completed batches         |
| failed_batches            | Failed batches                         |
| current_stage             | Current processing stage               |
| failure_code              | Normalized terminal failure code       |
| cancellation_requested_at | Cancellation request timestamp         |
| created_at                | Creation timestamp                     |
| started_at                | Processing start timestamp             |
| completed_at              | Completion timestamp                   |
| cancelled_at              | Cancellation timestamp                 |

The original log content is not stored in this entity.

## 4.2 Error Groups

Represents normalized and grouped errors.

| Field       | Purpose                           |
| ----------- | --------------------------------- |
| id          | Unique identifier                 |
| analysis_id | Parent analysis                   |
| fingerprint | Stable error identity             |
| severity    | Error severity                    |
| message     | Sanitized representative message  |
| occurrences | Number of occurrences             |
| first_seen  | First occurrence timestamp        |
| last_seen   | Most recent occurrence            |
| samples     | Sanitized representative examples |

Unique constraint:

`(analysis_id, fingerprint)`

This prevents duplicate groups within one analysis.

## 4.3 AI Batch Runs

Tracks individual AI requests.

| Field         | Purpose                                |
| ------------- | -------------------------------------- |
| id            | Unique identifier                      |
| analysis_id   | Parent analysis                        |
| batch_number  | Batch sequence                         |
| provider      | Provider identifier                    |
| model         | Model identifier                       |
| status        | Batch execution state                  |
| input_tokens  | Estimated or reported input tokens     |
| output_tokens | Reported output tokens, when available |
| attempts      | Number of attempts                     |
| result        | Validated batch result                 |
| failure_code  | Normalized failure reason              |
| created_at    | Creation timestamp                     |
| completed_at  | Completion timestamp                   |

Batch statuses:

- pending
- processing
- completed
- failed
- cancelled

Unique constraint:

`(analysis_id, batch_number)`

## 4.4 Analysis Reports

Stores the final structured report.

| Field           | Purpose                            |
| --------------- | ---------------------------------- |
| id              | Unique identifier                  |
| analysis_id     | Parent analysis                    |
| summary         | Executive summary                  |
| findings        | Structured findings in JSONB       |
| relationships   | Cross-batch relationships in JSONB |
| recommendations | Debugging recommendations in JSONB |
| created_at      | Report creation timestamp          |

Unique constraint:

`analysis_id`

Only one final report can exist per analysis.

## 4.5 Relationships

```text
analyses
   |
   +---- error_groups
   |
   +---- ai_batch_runs
   |
   +---- analysis_reports
```

All child records reference their parent analysis through foreign keys.

Deleting a terminal analysis must clean up its dependent database records through deliberate cascade behavior.

## 4.6 Indexes

Initial indexes:

- `analyses.status`
- `analyses.created_at`
- `error_groups.analysis_id`
- `error_groups.fingerprint`
- `ai_batch_runs.analysis_id`
- `ai_batch_runs.batch_number`
- `ai_batch_runs.status`
- `analysis_reports.analysis_id`

Indexes should support actual query patterns without unnecessary duplication.

---

# 5. Database Access Strategy

TypeORM will use explicit repositories.

Responsibilities:

**Entities**

- Define persistence structure.
- Define database relationships.
- Represent database records.

**Repositories**

- Encapsulate database queries.
- Retrieve and persist entities.
- Handle database-specific operations.

**Services**

- Enforce business rules.
- Coordinate operations.
- Manage application workflows.

**Controllers**

- Receive HTTP requests.
- Validate request-level input.
- Invoke application services.
- Return HTTP responses.

Migrations are the only approved mechanism for changing the database schema.

`synchronize` must remain disabled.

---

# 6. API Design

Base prefix:

`/api/v1`

## 6.1 Upload Analysis

`POST /api/v1/analyses`

Accepts a multipart file upload.

Successful response:

HTTP `202 Accepted`

```json
{
  "analysisId": "uuid",
  "status": "queued",
  "message": "Analysis successfully queued"
}
```

The request should not wait for the entire analysis to finish.

## 6.2 Retrieve Analysis Status

`GET /api/v1/analyses/:id`

Example:

```json
{
  "id": "uuid",
  "status": "processing",
  "progress": {
    "totalBatches": 10,
    "completedBatches": 4,
    "failedBatches": 0
  }
}
```

## 6.3 Retrieve Analysis Results

`GET /api/v1/analyses/:id/results`

Returns the final report when available.

## 6.4 Cancel Analysis

`POST /api/v1/analyses/:id/cancel`

Requests cancellation.

The operation must be idempotent.

## 6.5 Delete Analysis

`DELETE /api/v1/analyses/:id`

Only terminal analyses can be deleted.

Active analyses must be cancelled first.

## 6.6 Health Endpoints

`GET /health`

Checks whether the application process is alive.

`GET /ready`

Checks whether required infrastructure dependencies are available.

---

# 7. Background Job Processing

BullMQ manages background analysis jobs using Redis.

The API and worker run independently.

## 7.1 Job Lifecycle

1. API receives a valid upload.
2. Temporary file is created.
3. Analysis record is persisted.
4. Background job is queued.
5. API returns the analysis identifier.
6. Worker retrieves the job.
7. Worker processes the analysis.
8. Database records are updated throughout execution.

## 7.2 Idempotency

Job execution must account for retries and worker crashes.

The following constraints apply:

- Stable batch identities.
- Unique batch numbers per analysis.
- Completed batches should not be unnecessarily repeated.
- Final reports must not be duplicated.
- PostgreSQL is the source of truth.
- Redis job state alone must not determine whether an analysis is complete.

The worker must be able to recover safely from interrupted execution.

## 7.3 Retry Strategy

Maximum AI retries per batch: 2.

Retry decisions depend on failure type.

- Rate limits: Respect provider retry instructions.
- Selected server errors: Retry with controlled backoff.
- Timeouts: Retry within the configured limit.
- Authentication failures: Do not retry indefinitely.
- Invalid structured responses: Handle separately from transport failures.

---

# 8. Analysis Lifecycle and Cancellation

Analysis states:

```text
queued
processing
cancelling
completed
partial
failed
cancelled
```

## 8.1 Cancellation Rules

**Queued analysis**

- Invalidate or remove the queued job.
- Clean up its temporary file.
- Mark it cancelled.

**Processing analysis**

- Change status to cancelling.
- Stop scheduling new AI requests.
- Check cancellation at safe processing checkpoints.
- Allow an already-running request to finish if it cannot be interrupted.
- Discard the result of an in-flight request if cancellation was requested.
- Clean up temporary files.
- Mark the analysis cancelled.

Cancellation must be idempotent.

Terminal states cannot transition back into active states.

---

# 9. Log Processing Pipeline

The log-processing pipeline is deterministic.

```text
File
 |
 v
Streaming Reader
 |
 v
Line Processing
 |
 v
Format Detection
 |
 v
Entry Parsing
 |
 v
Sensitive Data Redaction
 |
 v
Error Grouping
 |
 v
Context Extraction
 |
 v
Batch Preparation
```

## 9.1 Supported Formats

Initial support:

- Conventional plain-text logs.
- `.log` files.
- `.txt` files.
- JSON Lines.
- Multiline stack traces.

Framework-specific parsers are out of scope.

## 9.2 Lenient Parsing

Unrecognized lines must not cause the entire file to fail.

The system should:

- Preserve unrecognized lines where possible.
- Report parsed and unparsed counts.
- Track parsing coverage.
- Avoid silently discarding information.

## 9.3 Sensitive Data Redaction

Redaction happens locally before external AI processing.

Potential sensitive values include:

- Passwords.
- API keys.
- Access tokens.
- Authorization headers.
- Email addresses.
- Database credentials.
- Other recognizable secrets.

Redaction must preserve enough surrounding structure to retain debugging usefulness.

Original sensitive log contents should not be unnecessarily persisted or written to application logs.

## 9.4 Error Grouping

Repeated errors are grouped using stable fingerprints.

Fingerprint generation should account for dynamic values such as timestamps, request IDs, and memory addresses where appropriate.

Grouping must not merge unrelated errors simply because their messages look similar.

## 9.5 Context Extraction

Extract relevant context around error occurrences.

Context may include:

- Nearby log entries.
- Associated stack traces.
- Timestamps.
- Severity.
- Related error occurrences.

Context extraction must respect the configured token budget.

---

# 10. AI Integration

## 10.1 Provider Abstraction

The AI module exposes a provider interface.

The initial implementation uses a Groq adapter.

Application services must not depend directly on the Groq SDK.

This allows another provider to be introduced without rewriting the analysis pipeline.

## 10.2 Initial Provider

Provider: Groq

Initial model: `openai/gpt-oss-20b`

Provider capabilities, model availability, structured-output support, rate limits, and data-handling terms must be verified against current documentation during implementation.

## 10.3 AI Responsibilities

The LLM handles:

- Error explanations.
- Possible root causes.
- Debugging recommendations.
- Pattern interpretation.
- Potential relationships between error groups.

The LLM does not handle deterministic parsing, counting, redaction, or basic grouping.

## 10.4 Structured Responses

AI responses must follow a defined schema.

The implementation will use provider-supported structured outputs where available.

Zod will validate responses at the application boundary.

Validation has three levels:

1. **Structural validation:** Is the response shaped correctly?
2. **Semantic validation:** Are required fields meaningful and consistent?
3. **Evidence validation:** Are findings supported by the supplied log evidence?

Valid JSON does not automatically mean valid analysis.

## 10.5 Prompt Safety

Uploaded log content is untrusted data.

Instructions embedded inside logs must never be treated as system or developer instructions.

The model must be instructed to analyze log content as data only.

AI must never execute shell commands, access databases, or modify files.

---

# 11. Batching and Aggregation

Maximum estimated AI input budget per batch: 6,000 tokens.

This includes:

- System instructions.
- Analysis instructions.
- Log content.
- Relevant context.

Output capacity must also be budgeted.

Large logs are divided into bounded batches.

Each batch is analyzed independently.

Validated results are then aggregated.

Cross-batch analysis identifies possible relationships that may not be visible within individual batches.

Cross-batch conclusions remain hypotheses unless supported by sufficient evidence.

Aggregation should be conditional when the number of batches is small.

---

# 12. Resource Limits

| Resource                     | Initial Limit |
| ---------------------------- | ------------: |
| Maximum upload size          |         25 MB |
| Maximum lines                |       250,000 |
| Estimated AI input per batch |  6,000 tokens |
| Concurrent analyses          |             1 |
| Concurrent AI requests       |             1 |
| Maximum AI retries per batch |             2 |

These values must be configurable through environment variables.

The application must process files incrementally rather than loading arbitrarily large files into memory.

---

# 13. Temporary Storage

Uploaded files are stored temporarily on the local filesystem.

Storage responsibilities include:

- Safe temporary filenames.
- Controlled storage locations.
- File cleanup after processing.
- Cleanup after cancellation.
- Cleanup after terminal failure.
- Handling interrupted worker execution.

The original filename is metadata, not a filesystem path.

Original sensitive file contents should not be retained unnecessarily.

---

# 14. Configuration and Secrets

Configuration is loaded through environment variables.

Sensitive credentials must never be committed to Git.

`.env.example` documents the expected configuration without real credentials.

Configuration must cover:

- Application environment.
- HTTP port.
- Database connection.
- Redis connection.
- AI provider credentials.
- AI model selection.
- Upload limits.
- Processing limits.
- Concurrency limits.
- Retry limits.
- Temporary storage location.

Configuration should be validated at application startup.

Invalid configuration should prevent the application from starting.

---

# 15. Logging and Observability

Pino is the application logging library.

Logs should support debugging and operational visibility without exposing sensitive data.

Useful fields include:

- Analysis ID.
- Job ID.
- Batch number.
- Processing stage.
- Error code.
- Execution duration.
- Provider identifier.
- Retry attempt.

Never log:

- API keys.
- Passwords.
- Full sensitive log contents.
- Unredacted AI prompts containing sensitive information.

Errors should be normalized into application-level error categories.

---

# 16. Testing Strategy

Vitest is the testing framework.

Testing should cover individual components and their interactions.

## 16.1 Unit Tests

Test:

- Log parsing.
- Multiline stack trace handling.
- Redaction.
- Error fingerprint generation.
- Grouping.
- Context extraction.
- Token estimation.
- AI response validation.
- State transitions.
- Cancellation rules.

## 16.2 Integration Tests

Test:

- PostgreSQL repositories.
- TypeORM persistence.
- Database migrations.
- Queue interactions.
- Worker processing.
- AI provider adapter behavior.

External AI calls should be mocked in routine automated tests.

## 16.3 Failure Tests

Test:

- Invalid uploads.
- Malformed log entries.
- Missing credentials.
- Database connection failures.
- Redis failures.
- Provider timeouts.
- Rate limits.
- Invalid AI responses.
- Worker interruptions.
- Duplicate job execution.
- Cancellation during processing.
- Temporary-file cleanup.

## 16.4 Testing Principle

Tests should verify actual behavior and business rules, not merely implementation details.

Important failure paths must be tested before shipping.

---

# 17. Security Requirements

The initial application is single-user and local.

Authentication is out of scope for the MVP.

Security requirements:

- Bind the API to localhost by default.
- Do not expose unauthenticated upload endpoints publicly.
- Validate uploaded files.
- Enforce upload and processing limits.
- Sanitize sensitive information before external AI requests.
- Keep secrets outside source control.
- Treat uploaded logs as untrusted input.
- Prevent path traversal through uploaded filenames.
- Avoid sensitive application logs.
- Clean up temporary files.

No authentication does not mean no security.

---

# 18. Implementation Roadmap

Implementation will proceed incrementally.

### Phase 1 — Repository Foundation

- Initialize Node.js and TypeScript.
- Configure project scripts.
- Configure environment validation.
- Establish application entry points.
- Configure Pino.
- Establish basic error handling.

### Phase 2 — Database Foundation

- Configure PostgreSQL.
- Configure TypeORM.
- Implement entities.
- Implement repositories.
- Create initial migrations.
- Test persistence.

### Phase 3 — HTTP API Foundation

- Configure Express.
- Establish routing.
- Add request validation.
- Add upload handling.
- Implement health and readiness endpoints.

### Phase 4 — Log Processing

- Implement streaming reader.
- Implement supported parsers.
- Implement multiline handling.
- Implement redaction.
- Implement error grouping.
- Implement context extraction.
- Add comprehensive tests.

### Phase 5 — AI Integration

- Define provider interface.
- Implement Groq adapter.
- Define response schemas.
- Implement response validation.
- Test provider failures and invalid responses.

### Phase 6 — Background Processing

- Configure Redis.
- Configure BullMQ.
- Implement queue and worker.
- Implement processing orchestration.
- Implement retries and idempotency.
- Implement cancellation.

### Phase 7 — Analysis and Reporting

- Implement batching.
- Implement batch analysis.
- Implement result aggregation.
- Implement report persistence.
- Implement analysis retrieval.

### Phase 8 — Reliability and Completion

- Run integration and failure tests.
- Review security boundaries.
- Verify temporary-file cleanup.
- Verify resource limits.
- Complete API documentation.
- Update README.
- Prepare the MVP for deployment.

---

# 19. Definition of Done

LogSense MVP is complete when:

1. A supported log file can be uploaded.
2. Invalid uploads are rejected safely.
3. Large files are processed incrementally.
4. Sensitive information is redacted before external AI processing.
5. Errors are parsed and grouped.
6. AI analysis produces validated structured findings.
7. Reports are persisted and retrievable.
8. Background jobs handle recoverable failures.
9. Cancellation works safely.
10. Partial failures are represented accurately.
11. Temporary files are cleaned up.
12. Automated tests cover important success and failure paths.
13. The application runs locally with documented setup instructions.

**End of Technical Design v1.1**
