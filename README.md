# LogSense

**AI-powered application log analysis for developers.**

LogSense is a developer tool that combines deterministic log processing with AI-assisted reasoning to help developers understand application errors, investigate potential root causes, and identify useful debugging steps.

Instead of sending entire log files directly to an LLM, LogSense processes, sanitizes, groups, and organizes log data before submitting relevant information for AI analysis.

## Problem

Application logs can contain thousands of entries, repeated errors, stack traces, and unrelated information.

Manually investigating them can be time-consuming. Sending entire files to an AI model can also introduce unnecessary token consumption, privacy risks, and context-window limitations.

LogSense addresses these problems through a structured log-processing and AI-analysis pipeline.

## Core Features

* Upload `.log` and `.txt` files.
* Parse conventional text logs and JSON Lines.
* Handle multiline stack traces.
* Detect and group repeated errors.
* Redact sensitive information before external AI processing.
* Process large logs in bounded batches.
* Generate AI-powered error explanations.
* Identify possible root causes and relationships between errors.
* Recommend debugging steps.
* Retrieve previous analysis reports.
* Track background analysis progress.
* Handle failures, retries, and cancellation.

## Architecture

LogSense uses a modular monolith architecture with separate API and background worker processes.

```text
Client
  |
  v
Express API
  |
  v
File Validation
  |
  v
BullMQ / Redis
  |
  v
Background Worker
  |
  v
Log Processing Pipeline
  |
  +--> Parsing
  +--> Redaction
  +--> Error Grouping
  +--> Context Extraction
  |
  v
AI Analysis
  |
  v
Response Validation
  |
  v
Result Aggregation
  |
  v
PostgreSQL
```

Deterministic software handles predictable operations. AI is reserved for tasks requiring interpretation and reasoning.

## Technology Stack

| Component        | Technology         |
| ---------------- | ------------------ |
| Runtime          | Node.js            |
| Language         | TypeScript         |
| HTTP framework   | Express            |
| Database         | PostgreSQL         |
| ORM              | TypeORM            |
| Job queue        | BullMQ             |
| Queue storage    | Redis              |
| AI provider      | Groq               |
| Initial AI model | openai/gpt-oss-20b |
| Validation       | Zod                |
| Logging          | Pino               |
| Testing          | Vitest             |
| Package manager  | pnpm               |

## Project Structure

```text
logsense/
├── docs/
│   ├── PRD.md
│   ├── SYSTEM_DESIGN.md
│   ├── TECHNICAL_DESIGN.md
│   └── adr/
├── src/
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Prerequisites

* Node.js 24 or compatible supported version.
* pnpm.
* PostgreSQL.
* Redis.
* Git.
* Groq API credentials for AI analysis.

The API and worker are designed to run locally during initial development.

## Configuration

Application configuration will be managed through environment variables.

Create a local `.env` file using `.env.example` as a reference.

Expected configuration categories include:

* Application environment and port.
* PostgreSQL connection.
* Redis connection.
* Groq API credentials.
* AI model selection.
* Upload and processing limits.
* Concurrency and retry limits.
* Temporary storage location.

Never commit `.env` or real credentials to version control.

## Installation and Development

Installation and startup instructions will be finalized as the application foundation and infrastructure are implemented.

The development setup will include:

1. Installing dependencies.
2. Configuring environment variables.
3. Connecting PostgreSQL.
4. Connecting Redis.
5. Running database migrations.
6. Starting the API.
7. Starting the background worker.

## Testing

Vitest will be used for automated testing.

Testing will cover:

* Log parsing.
* Sensitive-data redaction.
* Error grouping.
* AI response validation.
* Database operations.
* Background job processing.
* Cancellation.
* Failure handling.
* Integration workflows.

## API Overview

Base prefix: `/api/v1`

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/analyses`             | Upload a log file for analysis |
| GET    | `/analyses/:id`         | Retrieve analysis status       |
| GET    | `/analyses/:id/results` | Retrieve analysis results      |
| POST   | `/analyses/:id/cancel`  | Cancel an analysis             |
| DELETE | `/analyses/:id`         | Delete a terminal analysis     |
| GET    | `/health`               | Check application health       |
| GET    | `/ready`                | Check dependency readiness     |

## Initial Resource Limits

| Resource                     |        Limit |
| ---------------------------- | -----------: |
| Maximum upload size          |        25 MB |
| Maximum log lines            |      250,000 |
| Estimated AI input per batch | 6,000 tokens |
| Concurrent analyses          |            1 |
| Concurrent AI requests       |            1 |
| Maximum AI retries per batch |            2 |

These limits will be configurable.

## Security

LogSense is initially designed as a local, single-user application.

Security measures include:

* Localhost-only binding by default.
* File validation and processing limits.
* Sensitive-data redaction before external AI requests.
* Environment-based secret management.
* Safe temporary-file handling.
* Protection against prompt injection through untrusted log contents.
* No AI-driven command execution or file modification.

## Documentation

Detailed project documentation:

* [Product Requirements](docs/PRD.md)
* [System Design](docs/SYSTEM_DESIGN.md)
* [Technical Design](docs/TECHNICAL_DESIGN.md)
* [Architecture Decision Records](docs/adr/)

## Project Status

**Current stage:** Documentation and repository foundation.

The architecture and initial technical decisions have been established. Implementation will proceed incrementally, with additional technical decisions documented when actual requirements arise.

## License

MIT
