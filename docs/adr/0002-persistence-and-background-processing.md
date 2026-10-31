# ADR-002: Persistence and Background Processing

**Status:** Accepted

## Context

LogSense must persist analysis results and process potentially large log files without blocking HTTP requests.

It also needs controlled retries, progress tracking, cancellation, and recovery from interrupted processing.

## Decisions

### PostgreSQL

Use PostgreSQL as the primary database.

### TypeORM

Use TypeORM with the Data Mapper pattern.

Repositories handle persistence, while business logic remains in services.

### Explicit Migrations

Disable automatic schema synchronization.

Use explicit database migrations for schema changes.

### BullMQ and Redis

Use BullMQ with Redis for background job processing.

The API accepts requests and queues jobs. A separate worker performs the analysis.

### Database as Source of Truth

PostgreSQL remains the authoritative source for analysis records, batch results, and report completion.

Redis job state alone must not determine whether an analysis is complete.

### Idempotent Processing

Use stable batch identities, database uniqueness constraints, and safe retry behavior to prevent unnecessary duplicate processing.

### Concurrency

Initial limits:

- One concurrent analysis.
- One concurrent AI request.
- Two maximum retries per AI batch.

## Consequences

**Positive**

- HTTP requests remain responsive.
- Long-running work is handled asynchronously.
- Processing can recover from certain interruptions.
- Database records provide durable application state.

**Trade-offs**

- Redis becomes an additional infrastructure dependency.
- Worker lifecycle and job recovery require careful implementation.
- Idempotency must be enforced across application and database boundaries.

## Alternatives Considered

- Synchronous HTTP processing: unsuitable for potentially long-running analysis.
- PostgreSQL-only job queue: introduces additional queue-management work when BullMQ already provides the required functionality.
- Microservice architecture: unnecessary for the initial workload.

## Final Decision

Use PostgreSQL and TypeORM for persistence, with BullMQ and Redis for background processing.
