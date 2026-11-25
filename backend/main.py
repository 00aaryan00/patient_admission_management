"""FastAPI application and REST endpoints for Patient Admission Management."""

from contextlib import asynccontextmanager
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .constants import DEPARTMENTS, DOCTORS, GENDERS, STATUSES, WARDS
from .database import adapt_query, db_session, init_db
from .schemas import PatientCreate, PatientOut, PatientUpdate


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize database tables on server startup."""
    init_db()
    yield


app = FastAPI(title="Patient Admission Management API", lifespan=lifespan)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """Return clear field-level validation error messages."""
    errors: dict[str, str] = {}
    for err in exc.errors():
        loc = err.get("loc", ())
        field = str(loc[-1]) if loc else "body"
        msg = err.get("msg", "Invalid value")
        if msg.startswith("Value error, "):
            msg = msg.removeprefix("Value error, ")
        errors[field] = msg

    first_message = next(iter(errors.values()), "Validation failed")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_message, "errors": errors},
    )


def _row_to_patient(row) -> PatientOut:
    """Convert a database row (sqlite3.Row or dict) into a PatientOut model."""
    return PatientOut(**dict(row))


@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


@app.get("/meta")
def get_meta():
    """Return allowed dropdown options for the frontend."""
    return {
        "genders": GENDERS,
        "wards": WARDS,
        "departments": DEPARTMENTS,
        "doctors": DOCTORS,
        "statuses": STATUSES,
    }


@app.get("/patients", response_model=list[PatientOut])
def list_patients(
    search: Optional[str] = Query(default=None, description="Search by patient name"),
    ward: Optional[str] = Query(default=None),
    department: Optional[str] = Query(default=None),
    doctor: Optional[str] = Query(default=None),
    patient_status: Optional[str] = Query(default=None, alias="status"),
):
    """List patients with optional name search and dropdown filters."""
    clauses: list[str] = []
    params: list[str] = []

    if search and search.strip():
        clauses.append("LOWER(name) LIKE ?")
        params.append(f"%{search.strip().lower()}%")

    for column, value in (
        ("ward", ward),
        ("department", department),
        ("doctor", doctor),
        ("status", patient_status),
    ):
        if value and value.strip():
            clauses.append(f"{column} = ?")
            params.append(value.strip())

    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    query = adapt_query(f"SELECT * FROM patients {where_sql} ORDER BY id DESC")

    with db_session() as conn:
        rows = conn.execute(query, params).fetchall()
    return [_row_to_patient(row) for row in rows]


@app.post("/patients", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientCreate):
    """Add a new patient record."""
    query = adapt_query(
        """
        INSERT INTO patients (name, age, gender, ward, department, doctor, admission_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
        """
    )
    params = (
        payload.name,
        payload.age,
        payload.gender,
        payload.ward,
        payload.department,
        payload.doctor,
        payload.admission_date.isoformat(),
        payload.status,
    )
    with db_session() as conn:
        row = conn.execute(query, params).fetchone()
    return _row_to_patient(row)


@app.put("/patients/{patient_id}", response_model=PatientOut)
def update_patient(patient_id: int, payload: PatientUpdate):
    """Update an existing patient record."""
    query = adapt_query(
        """
        UPDATE patients
        SET name = ?, age = ?, gender = ?, ward = ?, department = ?, doctor = ?, admission_date = ?, status = ?
        WHERE id = ?
        RETURNING *
        """
    )
    params = (
        payload.name,
        payload.age,
        payload.gender,
        payload.ward,
        payload.department,
        payload.doctor,
        payload.admission_date.isoformat(),
        payload.status,
        patient_id,
    )
    with db_session() as conn:
        row = conn.execute(query, params).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return _row_to_patient(row)


@app.patch("/patients/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(patient_id: int):
    """Mark an admitted patient as Discharged."""
    query = adapt_query(
        "UPDATE patients SET status = 'Discharged' WHERE id = ? RETURNING *"
    )
    with db_session() as conn:
        row = conn.execute(query, (patient_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return _row_to_patient(row)


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int):
    """Delete a patient record by ID."""
    query = adapt_query("DELETE FROM patients WHERE id = ? RETURNING id")
    with db_session() as conn:
        row = conn.execute(query, (patient_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return {"message": "Patient deleted", "id": patient_id}
