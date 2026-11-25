import { useState } from "react";
import { ApiError } from "../api.js";
import { getTodayISO, validatePatientForm } from "../validation.js";

/**
 * Reusable modal form for adding a new patient or editing an existing one.
 */
export default function PatientForm({ initialPatient, meta, onSubmit, onClose }) {
  const isEdit = Boolean(initialPatient);

  const [values, setValues] = useState({
    name: initialPatient?.name ?? "",
    age: initialPatient?.age ?? "",
    gender: initialPatient?.gender ?? "",
    ward: initialPatient?.ward ?? "",
    department: initialPatient?.department ?? "",
    doctor: initialPatient?.doctor ?? "",
    admission_date: initialPatient?.admission_date ?? getTodayISO(),
    status: initialPatient?.status ?? "Admitted",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { errors: clientErrors, isValid, cleanedName } = validatePatientForm(
      values,
      meta,
      isEdit
    );

    if (!isValid) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      await onSubmit({
        name: cleanedName,
        age: Number(values.age),
        gender: values.gender,
        ward: values.ward,
        department: values.department,
        doctor: values.doctor,
        admission_date: values.admission_date,
        status: isEdit ? values.status : "Admitted",
      });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      } else {
        setServerError(err.message || "Failed to save patient");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h2>{isEdit ? "Edit Patient" : "Add New Patient"}</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div className="alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="patient-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Patient Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                placeholder="e.g. Aarav Mehta"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="age">Age (0–120) *</label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={values.age}
                onChange={handleChange}
                placeholder="e.g. 34"
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                {meta.genders.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="ward">Ward *</label>
              <select
                id="ward"
                name="ward"
                value={values.ward}
                onChange={handleChange}
              >
                <option value="">Select ward</option>
                {meta.wards.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.ward && <span className="field-error">{errors.ward}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={values.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {meta.departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className="field-error">{errors.department}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="doctor">Doctor *</label>
              <select
                id="doctor"
                name="doctor"
                value={values.doctor}
                onChange={handleChange}
              >
                <option value="">Select doctor</option>
                {meta.doctors.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.doctor && <span className="field-error">{errors.doctor}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="admission_date">Admission Date *</label>
              <input
                id="admission_date"
                name="admission_date"
                type="date"
                max={getTodayISO()}
                value={values.admission_date}
                onChange={handleChange}
              />
              {errors.admission_date && (
                <span className="field-error">{errors.admission_date}</span>
              )}
            </div>

            {isEdit && (
              <div className="form-field">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                >
                  {meta.statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.status && <span className="field-error">{errors.status}</span>}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Admit Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
