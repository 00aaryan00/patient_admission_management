/**
 * Confirmation modal before permanently deleting a patient record.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card confirm-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close confirmation"
          >
            ✕
          </button>
        </div>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
