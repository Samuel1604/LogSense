# ADR-003: AI Integration and Processing Strategy

**Status:** Accepted

## Context

LogSense must analyze potentially large and sensitive application logs.

Sending entire files directly to an LLM would introduce unnecessary token consumption, privacy risks, and context-window constraints.

Basic log processing also requires predictable and testable behavior.

## Decisions

### Deterministic Processing First

Use conventional software logic for:

- Parsing.
- Timestamp extraction.
- Severity detection.
- Sensitive-data redaction.
- Error grouping.
- Counting.
- Context extraction.
- Batch preparation.

Use AI for tasks requiring probabilistic reasoning:

- Error explanations.
- Possible root causes.
- Pattern interpretation.
- Debugging recommendations.
- Relationships between error groups.

### Bounded Batch Analysis

Divide large logs into bounded batches.

Initial estimated input budget: 6,000 tokens per batch, including instructions and context.

Analyze batches independently before aggregating their results.

### Conditional Cross-Batch Analysis

Use a subsequent aggregation stage to identify potential relationships across batches when necessary.

Do not introduce unnecessary aggregation for small analyses.

### Provider Abstraction

Define an AI provider interface.

Implement Groq as the initial provider using `openai/gpt-oss-20b`.

Provider-specific implementation must remain isolated behind the adapter.

### Structured Output

Use provider-supported structured outputs where available.

Validate responses with Zod before accepting them into the application.

Validation must consider:

- Structure.
- Semantic consistency.
- Supporting evidence.

### Security

Redact sensitive information before external AI requests.

Treat uploaded log contents as untrusted data, not instructions.

AI must not execute commands, access databases, or modify application files.

## Consequences

**Positive**

- Predictable preprocessing.
- Better control over token consumption.
- Reduced unnecessary exposure of sensitive information.
- Easier provider replacement.
- Testable AI boundaries.

**Trade-offs**

- Parsing and redaction require careful implementation.
- Batching can lose relationships between distant events.
- AI findings remain probabilistic and require evidence validation.
- Provider-specific structured-output capabilities may differ.

## Alternatives Considered

- Sending complete log files to the LLM: inefficient and potentially unsafe.
- Using an autonomous AI agent: unnecessary for the defined workflow.
- Hard-coding Groq throughout the application: creates avoidable provider dependency.
- Relying exclusively on JSON parsing: does not guarantee application-level correctness.

## Final Decision

Use a deterministic log-processing pipeline with bounded LLM analysis, structured response validation, and provider abstraction.
