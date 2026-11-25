"""Pydantic schemas and validation rules for Patient Admission Management."""

from datetime import date
import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from .constants import DEPARTMENTS, DOCTORS, GENDERS, STATUSES, WARDS

NAME_PATTERN = re.compile(r"^[A-Za-z]+(?: [A-Za-z]+)*$")


def _validate_choice(value: str, allowed: list[str], label: str) -> str:
    """Validate that a string value belongs to an allowed option list."""
    cleaned = value.strip() if isinstance(value, str) else ""
    if cleaned not in allowed:
        raise ValueError(f"{label} must be one of: {', '.join(allowed)}")
    return cleaned


class PatientBase(BaseModel):
    """Shared patient fields and validation rules."""

    name: str = Field(..., description="Patient full name (letters only)")
    age: int = Field(..., description="Patient age between 0 and 120")
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: date
    status: str = "Admitted"

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Name is required")
        if not NAME_PATTERN.fullmatch(cleaned):
            raise ValueError("Name must contain letters only")
        return cleaned

    @field_validator("age")
    @classmethod
    def validate_age(cls, value: int) -> int:
        if value < 0 or value > 120:
            raise ValueError("Age must be between 0 and 120")
        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        return _validate_choice(value, GENDERS, "Gender")

    @field_validator("ward")
    @classmethod
    def validate_ward(cls, value: str) -> str:
        return _validate_choice(value, WARDS, "Ward")

    @field_validator("department")
    @classmethod
    def validate_department(cls, value: str) -> str:
        return _validate_choice(value, DEPARTMENTS, "Department")

    @field_validator("doctor")
    @classmethod
    def validate_doctor(cls, value: str) -> str:
        return _validate_choice(value, DOCTORS, "Doctor")

    @field_validator("admission_date")
    @classmethod
    def validate_admission_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Admission date cannot be in the future")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_choice(value, STATUSES, "Status")


class PatientCreate(PatientBase):
    """Payload for creating a new patient."""

    status: Optional[str] = "Admitted"

    @field_validator("status", mode="before")
    @classmethod
    def default_status(cls, value: Optional[str]) -> str:
        return value or "Admitted"


class PatientUpdate(PatientBase):
    """Payload for updating an existing patient."""


class PatientOut(BaseModel):
    """Patient record returned by the API."""

    id: int
    name: str
    age: int
    gender: str
    ward: str
    department: str
    doctor: str
    admission_date: str
    status: str
    created_at: str
