"""SQLite database setup and connection helper.

Using a local SQLite file (patients.db) ensures all patient records persist
across server restarts without requiring an external database server.
"""

from contextlib import contextmanager
from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).resolve().parent / "patients.db"


def get_connection() -> sqlite3.Connection:
    """Open a SQLite connection with row_factory set to sqlite3.Row."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def db_session():
    """Yield a database connection and commit/close cleanly."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create the patients table if it does not already exist."""
    with db_session() as conn:
        conn.execute(
            """
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
        )
