/**
 * Displays the list of patients as a table on tablet/desktop
 * and stacked cards on mobile screens.
 */
export default function PatientList({
  patients,
  loading,
  onEdit,
  onDischarge,
  onDelete,
}) {
  if (loading) {
    return <div className="state-box">Loading patients...</div>;
  }

  if (patients.length === 0) {
    return (
      <div className="state-box">
        <p className="state-title">No patients found</p>
        <p className="state-subtitle">
          Add a new patient or adjust your search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="patient-list-wrapper">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age / Gender</th>
            <th>Ward</th>
            <th>Department</th>
            <th>Doctor</th>
            <th>Admission Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td data-label="Name" className="cell-name">
                {patient.name}
              </td>
              <td data-label="Age / Gender">
                {patient.age} yrs • {patient.gender}
              </td>
              <td data-label="Ward">{patient.ward}</td>
              <td data-label="Department">{patient.department}</td>
              <td data-label="Doctor">{patient.doctor}</td>
              <td data-label="Admission Date">{patient.admission_date}</td>
              <td data-label="Status">
                <span
                  className={`status-badge ${
                    patient.status === "Discharged"
                      ? "status-discharged"
                      : "status-admitted"
                  }`}
                >
                  {patient.status}
                </span>
              </td>
              <td data-label="Actions">
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => onEdit(patient)}
                  >
                    Edit
                  </button>
                  {patient.status !== "Discharged" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => onDischarge(patient)}
                    >
                      Discharge
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(patient)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
