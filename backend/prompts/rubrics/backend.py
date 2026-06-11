RUBRIC_QUESTIONS = [
"Is input validation required, including body, query params, path params, headers, data types, required fields, and invalid values?",
"Is authentication and authorization scope defined, including roles, permissions, ownership checks, tokens, or public/private access?",
"Are error response formats specified, including HTTP status codes, error schema, messages, error codes, and validation errors?",
"Are logging and observability requirements mentioned, including structured logs, metrics, traces, correlation IDs, and audit logs?",
"Are edge cases and failure scenarios described, such as missing data, duplicate requests, downstream failures, timeouts, and partial failures?",
"Is idempotency addressed when retries, POST/PUT/PATCH operations, payments, jobs, or external side effects are relevant?",
"Is rate limiting, throttling, quota handling, or abuse prevention considered?",
"Are API contract details defined, including endpoint paths, HTTP methods, request schema, response schema, and versioning?",
"Are security requirements included, such as input sanitization, CORS, CSRF, secrets handling, PII protection, and OWASP risks?",
"Are performance expectations defined, such as latency targets, pagination, caching, concurrency, and payload size limits?",
"Are data persistence and transaction requirements specified, including database writes, rollback behavior, consistency, and concurrency handling?",
"Is the expected deliverable clearly defined, such as OpenAPI spec, controller code, service layer, validation schema, tests, or documentation?",
]