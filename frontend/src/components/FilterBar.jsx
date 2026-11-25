/**
 * Search by name and filter by Ward, Department, and Doctor.
 */
export default function FilterBar({ filters, meta, onChange, onReset }) {
  const hasActiveFilters =
    filters.search || filters.ward || filters.department || filters.doctor;

  function updateField(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <section className="filter-bar" aria-label="Search and filter patients">
      <div className="form-field">
        <label htmlFor="filter-search">Search Name</label>
        <input
          id="filter-search"
          type="search"
          placeholder="Search patient name..."
          value={filters.search}
          onChange={(e) => updateField("search", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="filter-ward">Ward</label>
        <select
          id="filter-ward"
          value={filters.ward}
          onChange={(e) => updateField("ward", e.target.value)}
        >
          <option value="">All Wards</option>
          {meta.wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="filter-department">Department</label>
        <select
          id="filter-department"
          value={filters.department}
          onChange={(e) => updateField("department", e.target.value)}
        >
          <option value="">All Departments</option>
          {meta.departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="filter-doctor">Doctor</label>
        <select
          id="filter-doctor"
          value={filters.doctor}
          onChange={(e) => updateField("doctor", e.target.value)}
        >
          <option value="">All Doctors</option>
          {meta.doctors.map((doc) => (
            <option key={doc} value={doc}>
              {doc}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="filter-reset">
          <button type="button" className="btn btn-secondary" onClick={onReset}>
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
