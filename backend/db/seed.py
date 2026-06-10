from uuid import uuid4

from db.queries import get_db, insert_dimension_scores


DIMENSIONS = [
    "clarity",
    "completeness",
    "context",
    "constraints",
    "output_definition",
    "production_readiness",
]


def seed_db() -> None:
    with get_db() as conn:
        gov_count = conn.execute("SELECT COUNT(*) AS count FROM governance_scores").fetchone()["count"]
        eval_count = conn.execute("SELECT COUNT(*) AS count FROM evaluations").fetchone()["count"]

        if gov_count == 0:
            governance_rows = [
                ("Abhinav", 0.91, 67, 48),
                ("Team Alpha", 0.87, 45, 34),
                ("Team Zeta", 0.83, 33, 31),
                ("Team Beta", 0.81, 38, 28),
                ("Team Gamma", 0.79, 52, 41),
                ("Team Eta", 0.71, 24, 25),
                ("Team Delta", 0.74, 29, 22),
                ("Team Epsilon", 0.68, 19, 18),
            ]
            for name, avg_score, total, avg_improvement in governance_rows:
                conn.execute(
                    """
                    INSERT INTO governance_scores (id, team_or_user, avg_score, total_prompts, avg_improvement)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (str(uuid4()), name, avg_score, total, avg_improvement),
                )
            conn.commit()

        if eval_count == 0:
            samples = [
                (
                    "frontend",
                    "Write a React component for a user form",
                    "Create a React 18 + TypeScript user form component with accessible labels, validation, loading/error states, and RTL unit tests.",
                    0.42,
                    0.86,
                    104.76,
                    2,
                ),
                (
                    "backend",
                    "Create login API",
                    "Design a FastAPI login endpoint with request validation, secure password verification, JWT response schema, HTTP error codes, rate limiting notes, and logging requirements.",
                    0.38,
                    0.84,
                    121.05,
                    2,
                ),
                (
                    "devops",
                    "Deploy my app",
                    "Create an AWS ECS deployment plan with CI/CD stages, rollback strategy, CPU/memory limits, monitoring, alerts, and idempotent infrastructure steps.",
                    0.36,
                    0.82,
                    127.78,
                    3,
                ),
                (
                    "testing",
                    "Write tests for checkout",
                    "Write unit, integration, and e2e test scenarios for checkout with mocked payment provider, edge cases, setup/teardown, and 85% coverage target.",
                    0.45,
                    0.88,
                    95.56,
                    2,
                ),
                (
                    "database",
                    "Design tables for orders",
                    "Design normalized PostgreSQL order tables for 10M records, indexing strategy, read/write ratio assumptions, migration steps, and query performance expectations.",
                    0.44,
                    0.85,
                    93.18,
                    2,
                ),
                (
                    "system_design",
                    "Design chat app",
                    "Design a real-time chat system for 1M DAU with latency budget, consistency trade-offs, failure recovery, capacity estimates, and cost-aware cloud architecture.",
                    0.41,
                    0.87,
                    112.20,
                    3,
                ),
            ]
            for domain, original, final, original_score, final_score, improvement, iterations in samples:
                evaluation_id = str(uuid4())
                conn.execute(
                    """
                    INSERT INTO evaluations (
                        id, original_prompt, final_prompt, domain, original_score,
                        final_score, improvement_pct, iteration_count
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (evaluation_id, original, final, domain, original_score, final_score, improvement, iterations),
                )
                dims = [
                    {
                        "iterationNumber": iterations,
                        "dimensions": [
                            {
                                "name": name,
                                "score": round(min(final_score + (idx - 2) * 0.01, 1.0), 2),
                                "failureReason": None if final_score >= 0.8 else "Needs more specificity",
                            }
                            for idx, name in enumerate(DIMENSIONS)
                        ],
                    }
                ]
                conn.commit()
                insert_dimension_scores(evaluation_id, dims)
