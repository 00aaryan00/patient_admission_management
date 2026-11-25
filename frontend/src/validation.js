/**
 * Frontend validation rules matching the backend Pydantic schema.
 */

const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validatePatientForm(values, meta, isEdit = false) {
  const errors = {};

  const cleanedName = String(values.name || "").trim().replace(/\s+/g, " ");
  if (!cleanedName) {
    errors.name = "Name is required";
  } else if (!NAME_PATTERN.test(cleanedName)) {
    errors.name = "Name must contain letters only";
  }

  const rawAge = String(values.age ?? "").trim();
  if (rawAge === "") {
    errors.age = "Age is required";
  } else {
    const parsedAge = Number(rawAge);
    if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      errors.age = "Age must be a whole number between 0 and 120";
    }
  }

  const selectFields = [
    ["gender", "Gender", meta.genders],
    ["ward", "Ward", meta.wards],
    ["department", "Department", meta.departments],
    ["doctor", "Doctor", meta.doctors],
  ];

  for (const [key, label, allowed] of selectFields) {
    if (!values[key]) {
      errors[key] = `${label} is required`;
    } else if (allowed.length > 0 && !allowed.includes(values[key])) {
      errors[key] = `Please select a valid ${label.toLowerCase()}`;
    }
  }

  if (!values.admission_date) {
    errors.admission_date = "Admission date is required";
  } else if (values.admission_date > getTodayISO()) {
    errors.admission_date = "Admission date cannot be in the future";
  }

  if (isEdit && meta.statuses.length > 0 && !meta.statuses.includes(values.status)) {
    errors.status = "Please select a valid status";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    cleanedName,
  };
}
