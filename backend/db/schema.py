import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def get_db_path() -> str:
    return os.getenv("DB_PATH", "./promptgrade.db")


def init_db() -> None:
    db_path = get_db_path()
    parent = Path(db_path).expanduser().resolve().parent
    parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS evaluations (
              id              TEXT PRIMARY KEY,
              original_prompt TEXT NOT NULL,
              final_prompt    TEXT NOT NULL,
              domain          TEXT NOT NULL,
              original_score  REAL NOT NULL,
              final_score     REAL NOT NULL,
              improvement_pct REAL NOT NULL,
              iteration_count INTEGER NOT NULL,
              created_at      TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS dimension_scores (
              id             TEXT PRIMARY KEY,
              evaluation_id  TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
              iteration      INTEGER NOT NULL,
              dimension      TEXT NOT NULL,
              score          REAL NOT NULL,
              failure_reason TEXT
            );

            CREATE TABLE IF NOT EXISTS governance_scores (
              id              TEXT PRIMARY KEY,
              team_or_user    TEXT NOT NULL UNIQUE,
              avg_score       REAL NOT NULL,
              total_prompts   INTEGER NOT NULL,
              avg_improvement REAL NOT NULL,
              updated_at      TEXT DEFAULT (datetime('now'))
            );
            """
        )
        conn.commit()
