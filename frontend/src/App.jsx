import { useCallback, useEffect, useState } from "react";
import {
  createPatient,
  deletePatient,
  dischargePatient,
  fetchMeta,
  fetchPatients,
  updatePatient,
} from "./api.js";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import FilterBar from "./components/FilterBar.jsx";
import PatientForm from "./components/PatientForm.jsx";
import PatientList from "./components/PatientList.jsx";

const EMPTY_META = {
  genders: [],
  wards: [],
  departments: [],
  doctors: [],
  statuses: ["Admitted", "Discharged"],
};

const INITIAL_FILTERS = {
  search: "",
  ward: "",
  department: "",
  doctor: "",
};

export default function App() {
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState({ open: false, patient: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadPatients = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPatients(activeFilters);
      setPatients(data);
    } catch (err) {
      setError(err.message || "Failed to connect to the backend API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(filters);
    }, 180);
    return () => clearTimeout(timer);
  }, [filters, loadPatients]);

  async function handleFormSubmit(payload) {
    if (modalState.patient) {
      await updatePatient(modalState.patient.id, payload);
    } else {
      await createPatient(payload);
    }
    setModalState({ open: false, patient: null });
    await loadPatients(filters);
  }

  async function handleDischarge(patient) {
    setError("");
    try {
      await dischargePatient(patient.id);
      await loadPatients(filters);
    } catch (err) {
      setError(err.message || "Failed to discharge patient.");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await deletePatient(deleteTarget.id);
      setDeleteTarget(null);
      await loadPatients(filters);
    } catch (err) {
      setError(err.message || "Failed to delete patient.");
    } finally {
      setDeleting(false);
    }
  }

  const admittedCount = patients.filter((p) => p.status === "Admitted").length;
  const dischargedCount = patients.filter((p) => p.status === "Discharged").length;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Patient Admission Management</h1>
          <p className="subtitle">Hospital Staff Portal</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalState({ open: true, patient: null })}
        >
          + Add Patient
        </button>
      </header>

      <section className="stats-grid" aria-label="Admission summary">
        <div className="stat-card">
          <span className="stat-label">Total Shown</span>
          <strong className="stat-value">{patients.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Currently Admitted</span>
          <strong className="stat-value text-blue">{admittedCount}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Discharged</span>
          <strong className="stat-value text-green">{dischargedCount}</strong>
        </div>
      </section>

      <FilterBar
        filters={filters}
        meta={meta}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      <main className="card">
        <PatientList
          patients={patients}
          loading={loading}
          onEdit={(patient) => setModalState({ open: true, patient })}
          onDischarge={handleDischarge}
          onDelete={(patient) => setDeleteTarget(patient)}
        />
      </main>

      {modalState.open && (
        <PatientForm
          initialPatient={modalState.patient}
          meta={meta}
          onSubmit={handleFormSubmit}
          onClose={() => setModalState({ open: false, patient: null })}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Patient"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          busy={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
