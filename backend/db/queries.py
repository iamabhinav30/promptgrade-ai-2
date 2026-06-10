import os
import sqlite3
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv

load_dotenv()


def get_db() -> sqlite3.Connection:
    db_path = os.getenv("DB_PATH", "./promptgrade.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _row_to_dict(row: sqlite3.Row | None) -> dict | None:
    return dict(row) if row is not None else None


def insert_evaluation(result: dict) -> None:
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO evaluations (
                id, original_prompt, final_prompt, domain, original_score,
                final_score, improvement_pct, iteration_count, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                result["evaluationId"],
                result["originalPrompt"],
                result["finalPrompt"],
                result["domain"],
                result["originalScore"],
                result["finalScore"],
                result["improvementPct"],
                result["iterationCount"],
                result["createdAt"],
            ),
        )
        conn.commit()


def insert_dimension_scores(evaluation_id: str, iterations: list) -> None:
    with get_db() as conn:
        for iteration in iterations:
            iteration_number = iteration.get("iterationNumber", 1)
            for dimension in iteration.get("dimensions", []):
                conn.execute(
                    """
                    INSERT INTO dimension_scores (
                        id, evaluation_id, iteration, dimension, score, failure_reason
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        str(uuid4()),
                        evaluation_id,
                        iteration_number,
                        dimension.get("name"),
                        float(dimension.get("score", 0)),
                        dimension.get("failureReason"),
                    ),
                )
        conn.commit()


def upsert_governance_score(team: str, result: dict) -> None:
    with get_db() as conn:
        existing = conn.execute(
            "SELECT * FROM governance_scores WHERE team_or_user = ?", (team,)
        ).fetchone()
        final_score = float(result.get("finalScore", 0))
        improvement = float(result.get("improvementPct", 0))
        if existing:
            total = int(existing["total_prompts"])
            new_total = total + 1
            avg_score = ((float(existing["avg_score"]) * total) + final_score) / new_total
            avg_improvement = (
                (float(existing["avg_improvement"]) * total) + improvement
            ) / new_total
            conn.execute(
                """
                UPDATE governance_scores
                SET avg_score = ?, total_prompts = ?, avg_improvement = ?, updated_at = datetime('now')
                WHERE team_or_user = ?
                """,
                (avg_score, new_total, avg_improvement, team),
            )
        else:
            conn.execute(
                """
                INSERT INTO governance_scores (
                    id, team_or_user, avg_score, total_prompts, avg_improvement
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (str(uuid4()), team, final_score, 1, improvement),
            )
        conn.commit()


def get_evaluations(domain: Optional[str] = None, limit: int = 20, offset: int = 0) -> dict:
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    with get_db() as conn:
        if domain:
            total = conn.execute(
                "SELECT COUNT(*) AS count FROM evaluations WHERE domain = ?", (domain,)
            ).fetchone()["count"]
            rows = conn.execute(
                """
                SELECT * FROM evaluations WHERE domain = ?
                ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?
                """,
                (domain, limit, offset),
            ).fetchall()
        else:
            total = conn.execute("SELECT COUNT(*) AS count FROM evaluations").fetchone()["count"]
            rows = conn.execute(
                """
                SELECT * FROM evaluations
                ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?
                """,
                (limit, offset),
            ).fetchall()
        return {"evaluations": [_evaluation_row_to_api(dict(row)) for row in rows], "total": total}


def get_evaluation_by_id(evaluation_id: str) -> dict | None:
    with get_db() as conn:
        evaluation = conn.execute("SELECT * FROM evaluations WHERE id = ?", (evaluation_id,)).fetchone()
        if not evaluation:
            return None
        dimension_rows = conn.execute(
            """
            SELECT iteration, dimension, score, failure_reason
            FROM dimension_scores
            WHERE evaluation_id = ?
            ORDER BY iteration ASC
            """,
            (evaluation_id,),
        ).fetchall()

    api = _evaluation_row_to_api(dict(evaluation))
    grouped: dict[int, list[dict]] = {}
    for row in dimension_rows:
        grouped.setdefault(int(row["iteration"]), []).append(
            {
                "name": row["dimension"],
                "score": row["score"],
                "failureReason": row["failure_reason"],
            }
        )
    iterations = []
    for iteration_number, dimensions in grouped.items():
        # Historical rows do not store rewritten prompt, so expose final prompt as the visible prompt.
        iterations.append(
            {
                "iterationNumber": iteration_number,
                "score": round(sum(d["score"] for d in dimensions) / max(len(dimensions), 1), 2),
                "dimensions": dimensions,
                "rewrittenPrompt": api["finalPrompt"],
            }
        )
    api["iterations"] = iterations
    return api


def get_analytics() -> dict:
    with get_db() as conn:
        avg_score = conn.execute(
            "SELECT COALESCE(AVG(final_score), 0) AS avg_score FROM evaluations"
        ).fetchone()["avg_score"]
        score_by_domain = conn.execute(
            """
            SELECT domain, ROUND(AVG(final_score), 3) AS avgScore, COUNT(*) AS count
            FROM evaluations GROUP BY domain ORDER BY domain
            """
        ).fetchall()
        top_failures = conn.execute(
            """
            SELECT failure_reason AS failureReason, COUNT(*) AS count
            FROM dimension_scores
            WHERE failure_reason IS NOT NULL AND TRIM(failure_reason) <> ''
            GROUP BY failure_reason
            ORDER BY count DESC LIMIT 5
            """
        ).fetchall()
        trend_by_day = conn.execute(
            """
            SELECT date(created_at) AS day, ROUND(AVG(final_score), 3) AS avgScore, COUNT(*) AS count
            FROM evaluations GROUP BY date(created_at) ORDER BY day ASC
            """
        ).fetchall()
        leaderboard = conn.execute(
            """
            SELECT team_or_user AS name, avg_score AS avgScore, total_prompts AS totalPrompts,
                   avg_improvement AS avgImprovement
            FROM governance_scores ORDER BY avg_score DESC
            """
        ).fetchall()
        total_evaluations = conn.execute(
            "SELECT COUNT(*) AS count FROM evaluations"
        ).fetchone()["count"]
        avg_improvement = conn.execute(
            "SELECT COALESCE(AVG(improvement_pct), 0) AS avg FROM evaluations"
        ).fetchone()["avg"]

    ranked = []
    for index, row in enumerate(leaderboard, start=1):
        item = dict(row)
        item["rank"] = index
        ranked.append(item)

    return {
        "avgScore": round(float(avg_score or 0), 3),
        "totalEvaluations": int(total_evaluations or 0),
        "avgImprovement": round(float(avg_improvement or 0), 2),
        "scoreByDomain": [dict(row) for row in score_by_domain],
        "topFailures": [dict(row) for row in top_failures],
        "trendByDay": [dict(row) for row in trend_by_day],
        "governanceLeaderboard": ranked,
    }


def _evaluation_row_to_api(row: dict) -> dict:
    return {
        "evaluationId": row["id"],
        "originalPrompt": row["original_prompt"],
        "finalPrompt": row["final_prompt"],
        "domain": row["domain"],
        "originalScore": row["original_score"],
        "finalScore": row["final_score"],
        "improvementPct": row["improvement_pct"],
        "iterationCount": row["iteration_count"],
        "iterations": [],
        "diff": _simple_diff(row["original_prompt"], row["final_prompt"]),
        "createdAt": row["created_at"],
    }


def _simple_diff(original: str, final: str) -> dict:
    original_words = set(original.lower().split())
    final_words = set(final.lower().split())
    return {
        "added": sorted(list(final_words - original_words)),
        "removed": sorted(list(original_words - final_words)),
    }
