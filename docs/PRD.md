# LogSense

## Product Requirements Document (PRD)

**Version:** 0.1
**Status:** Approved
**Project Type:** Local, single-user developer tool

### 1. Product Overview

LogSense is an AI-powered application log analyzer that helps developers understand errors and diagnose potential causes in application logs.

Users upload log files. LogSense processes the files, identifies and groups errors, sanitizes sensitive information, and uses an LLM to generate explanations and debugging recommendations.

### 2. Problem Statement

Application logs can contain thousands of entries, repeated errors, stack traces, and unrelated information.

Manually investigating these logs can be time-consuming. Sending entire log files directly to an LLM is also inefficient and potentially unsafe.

LogSense addresses this by combining deterministic log processing with AI-assisted analysis.

### 3. Target Users

* Backend developers.
* Software engineers.
* Developers investigating application failures.
* Developers who want to understand unfamiliar logs.

### 4. Core Features

1. Upload `.log` and `.txt` files.
2. Validate file types and file sizes.
3. Parse timestamps, severity levels, and messages.
4. Support conventional text logs, JSON Lines, and multiline stack traces.
5. Preserve unrecognized lines where possible.
6. Detect and redact sensitive information before external AI processing.
7. Group repeated and related errors.
8. Extract relevant context around errors.
9. Divide large logs into bounded AI-analysis batches.
10. Generate structured AI explanations and debugging recommendations.
11. Identify possible relationships between errors across batches.
12. Persist analysis metadata and reports.
13. Retrieve previous analysis results.
14. Handle failures, retries, cancellation, and partial analysis.

### 5. Analysis Output

The final report should contain:

* Executive summary.
* Identified error groups.
* Error severity and frequency.
* Possible root causes.
* Supporting log evidence.
* Relationships between errors.
* Recommended debugging steps.
* Analysis limitations and uncertainties.

AI-generated explanations must distinguish observed facts from hypotheses.

### 6. Functional Requirements

* Users can submit supported log files.
* Invalid files are rejected with meaningful errors.
* Large files are processed without loading the entire file into memory.
* Sensitive values are redacted before external AI requests.
* Individual AI batches are processed within configured token budgets.
* AI responses are validated before persistence.
* Users can check analysis progress.
* Users can retrieve completed or partial reports.
* Users can cancel active analyses.
* Users can delete terminal analyses.

### 7. Non-Functional Requirements

**Security**

* Redact sensitive information before external AI processing.
* Keep API credentials in environment variables.
* Never log secrets or complete sensitive log contents.
* Treat uploaded logs as untrusted input.
* Bind the local application to localhost by default.

**Reliability**

* Support controlled retries.
* Prevent duplicate batch processing where possible.
* Handle partial failures.
* Clean up temporary files.
* Validate all AI responses.

**Performance**

* Stream large files.
* Process uploads asynchronously.
* Limit concurrent analyses and AI requests.

**Maintainability**

* Use modular architecture.
* Separate business logic from infrastructure.
* Use explicit database migrations.
* Maintain automated tests.

### 8. Initial Constraints

| Constraint                          |        Limit |
| ----------------------------------- | -----------: |
| Maximum upload size                 |        25 MB |
| Maximum log lines                   |      250,000 |
| Estimated AI input budget per batch | 6,000 tokens |
| Concurrent analyses                 |            1 |
| Concurrent AI requests              |            1 |
| Maximum AI retries per batch        |            2 |

All limits should be configurable.

### 9. Out of Scope

The initial MVP will not include:

* Real-time log monitoring.
* Automatic production-server monitoring.
* Autonomous debugging.
* Automatic code modifications.
* Multi-user organization management.
* Subscription and billing functionality.
* Framework-specific log parsers.

### 10. Success Criteria

The MVP is successful when:

1. A developer can upload a supported log file.
2. LogSense can parse and group errors.
3. Sensitive information is removed before AI processing.
4. The AI produces valid, structured analysis.
5. Reports can be persisted and retrieved.
6. Failures and cancellations are handled safely.
7. Automated tests cover the important processing paths.
