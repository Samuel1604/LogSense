# ADR-001: Architecture and Runtime

**Status:** Accepted

## Context

LogSense needs a maintainable backend architecture capable of handling file processing, background jobs, database persistence, and AI integration.

The initial application is a single-user developer tool. Its expected workload does not justify the operational complexity of distributed services.

## Decisions

### Modular Monolith

Use a modular monolith with clearly separated application modules.

The API and background worker run as separate processes while sharing the same application codebase.

### Node.js and TypeScript

Use Node.js with TypeScript for application development.

### Express

Use Express as the HTTP framework.

### Dependency Injection

Use manual dependency injection with a small application composition container.

Do not introduce a dependency injection framework.

### Module Boundaries

Separate:

- Analyses
- Logs
- AI
- Jobs
- Infrastructure
- Shared utilities

Each module owns its responsibilities and exposes appropriate interfaces.

## Consequences

**Positive**

- Simpler deployment and development.
- Clear module boundaries.
- Easier debugging.
- Lower infrastructure overhead.
- Modules can evolve independently within the application.

**Trade-offs**

- Module boundaries require discipline.
- API and worker deployments share the same codebase.
- Future extraction into separate services may require additional work.

## Alternatives Considered

- Microservices: unnecessary operational complexity for the MVP.
- Fully layered application without module boundaries: weaker separation of business capabilities.

## Final Decision

Use a modular monolith with separate API and worker processes.
