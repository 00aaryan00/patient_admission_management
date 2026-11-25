"""Allowed option lists for Patient Admission Management.

Keeping these lists in one place ensures backend validation and API metadata
always stay in sync.
"""

GENDERS = ["Male", "Female", "Other"]

WARDS = ["General", "ICU", "Emergency", "Maternity", "Pediatrics"]

DEPARTMENTS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
]

DOCTORS = [
    "Dr. Sharma",
    "Dr. Patel",
    "Dr. Verma",
    "Dr. Nair",
    "Dr. Iyer",
]

STATUSES = ["Admitted", "Discharged"]
