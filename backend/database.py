"""Database setup and connection helper.

Uses PostgreSQL when DATABASE_URL is set (for persistent cloud deployment)
and falls back to local SQLite (patients.db) for zero-config local development.
"""

from contextlib import contextmanager
import os
from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).resolve().parent / "patients.db"
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
USE_POSTGRES = bool(DATABASE_URL)

if USE_POSTGRES:
    import psycopg
    from psycopg.rows import dict_row


def adapt_query(sql: str) -> str:
    """Convert SQLite '?' placeholders to PostgreSQL '%s' when using Postgres."""
    return sql.replace("?", "%s") if USE_POSTGRES else sql


@contextmanager
def db_session():
    """Yield a database connection and commit/close cleanly."""
    if USE_POSTGRES:
        conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create the patients table if it does not already exist."""
    if USE_POSTGRES:
        ddl = """
        CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            ward TEXT NOT NULL,
            department TEXT NOT NULL,
            doctor TEXT NOT NULL,
            admission_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Admitted',
            created_at TEXT NOT NULL DEFAULT (to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'))
        )
        """
    else:
        ddl = """
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            ward TEXT NOT NULL,
            department TEXT NOT NULL,
            doctor TEXT NOT NULL,
            admission_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Admitted',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """

    with db_session() as conn:
        conn.execute(ddl)
