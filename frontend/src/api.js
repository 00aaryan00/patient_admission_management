/**
 * Centralized API client for communicating with the FastAPI backend.
 * Uses VITE_API_URL in production and falls back to local FastAPI dev server.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, fieldErrors = {}, status = 400) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.detail || "Something went wrong",
      data.errors || {},
      response.status
    );
  }

  return data;
}

export function fetchMeta() {
  return request("/meta");
}

export function fetchPatients(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && String(value).trim()) {
      params.set(key, String(value).trim());
    }
  });
  const query = params.toString();
  return request(query ? `/patients?${query}` : "/patients");
}

export function createPatient(payload) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePatient(id, payload) {
  return request(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function dischargePatient(id) {
  return request(`/patients/${id}/discharge`, {
    method: "PATCH",
  });
}

export function deletePatient(id) {
  return request(`/patients/${id}`, {
    method: "DELETE",
  });
}
