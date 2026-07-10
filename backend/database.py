"""
Async SQLite database layer for the Tactix Savings Calculator.

Uses the `databases` library with aiosqlite for non-blocking DB access.
Tables:
  - leads: stores sales lead information and calculation summaries
  - calculation_logs: stores full calculation request/response logs
"""

import os
from datetime import datetime

import databases
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./tactix.db")
database = databases.Database(DATABASE_URL)


# ---------------------------------------------------------------------------
# Schema creation
# ---------------------------------------------------------------------------

_CREATE_LEADS_TABLE = """
CREATE TABLE IF NOT EXISTS leads (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    phone           TEXT,
    company         TEXT,
    budget          REAL    NOT NULL,
    duration_months INTEGER NOT NULL,
    num_laborers    INTEGER NOT NULL,
    total_loss      REAL    DEFAULT 0,
    total_recovery  REAL    DEFAULT 0,
    created_at      TEXT    NOT NULL
);
"""

_CREATE_CALCULATION_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS calculation_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    budget          REAL    NOT NULL,
    duration_months INTEGER NOT NULL,
    num_laborers    INTEGER NOT NULL,
    total_loss      REAL    DEFAULT 0,
    total_recovery  REAL    DEFAULT 0,
    net_savings     REAL    DEFAULT 0,
    payback_months  REAL    DEFAULT 0,
    created_at      TEXT    NOT NULL
);
"""


async def init_db() -> None:
    """Connect to the database and create tables if they don't exist."""
    await database.connect()
    
    # Automatically adjust SQL syntax if connecting to PostgreSQL
    is_postgres = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")
    if is_postgres:
        create_leads = _CREATE_LEADS_TABLE.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        create_logs = _CREATE_CALCULATION_LOGS_TABLE.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
    else:
        create_leads = _CREATE_LEADS_TABLE
        create_logs = _CREATE_CALCULATION_LOGS_TABLE

    await database.execute(create_leads)
    await database.execute(create_logs)


async def close_db() -> None:
    """Disconnect from the database."""
    await database.disconnect()


# ---------------------------------------------------------------------------
# Lead operations
# ---------------------------------------------------------------------------

async def save_lead(
    name: str,
    email: str,
    phone: str | None,
    company: str | None,
    budget: float,
    duration_months: int,
    num_laborers: int,
    total_loss: float = 0.0,
    total_recovery: float = 0.0,
) -> int:
    """
    Insert a new lead into the database.

    Returns:
        The auto-generated lead ID.
    """
    query = """
        INSERT INTO leads
            (name, email, phone, company, budget, duration_months,
             num_laborers, total_loss, total_recovery, created_at)
        VALUES
            (:name, :email, :phone, :company, :budget, :duration_months,
             :num_laborers, :total_loss, :total_recovery, :created_at)
    """
    values = {
        "name": name,
        "email": email,
        "phone": phone,
        "company": company,
        "budget": budget,
        "duration_months": duration_months,
        "num_laborers": num_laborers,
        "total_loss": total_loss,
        "total_recovery": total_recovery,
        "created_at": datetime.utcnow().isoformat(),
    }
    last_id = await database.execute(query=query, values=values)
    return last_id


async def get_leads() -> list[dict]:
    """
    Retrieve all leads, most recent first.

    Returns:
        List of lead records as dictionaries.
    """
    query = "SELECT * FROM leads ORDER BY id DESC"
    rows = await database.fetch_all(query)
    return [dict(row._mapping) for row in rows]


# ---------------------------------------------------------------------------
# Calculation log operations
# ---------------------------------------------------------------------------

async def log_calculation(
    budget: float,
    duration_months: int,
    num_laborers: int,
    total_loss: float,
    total_recovery: float,
    net_savings: float,
    payback_months: float,
) -> int:
    """
    Log a calculation to the database for analytics.

    Returns:
        The auto-generated log ID.
    """
    query = """
        INSERT INTO calculation_logs
            (budget, duration_months, num_laborers, total_loss,
             total_recovery, net_savings, payback_months, created_at)
        VALUES
            (:budget, :duration_months, :num_laborers, :total_loss,
             :total_recovery, :net_savings, :payback_months, :created_at)
    """
    values = {
        "budget": budget,
        "duration_months": duration_months,
        "num_laborers": num_laborers,
        "total_loss": total_loss,
        "total_recovery": total_recovery,
        "net_savings": net_savings,
        "payback_months": payback_months,
        "created_at": datetime.utcnow().isoformat(),
    }
    last_id = await database.execute(query=query, values=values)
    return last_id
