const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, { method = "GET", token, body, signal } = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const authApi = {
  signup: (payload) =>
    request("/auth/signup", {
      method: "POST",
      body: payload,
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: payload,
    }),
  me: (token) =>
    request("/auth/me", {
      token,
    }),
};

export const taskApi = {
  getTasks: (queryString, token, signal) =>
    request(`/tasks${queryString}`, {
      token,
      signal,
    }),
  createTask: (payload, token) =>
    request("/tasks", {
      method: "POST",
      token,
      body: payload,
    }),
  updateTask: (taskId, payload, token) =>
    request(`/tasks/${taskId}`, {
      method: "PUT",
      token,
      body: payload,
    }),
  deleteTask: (taskId, token) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
      token,
    }),
  toggleTaskCompletion: (taskId, token) =>
    request(`/tasks/${taskId}/toggle-complete`, {
      method: "PATCH",
      token,
    }),
};

export const analyticsApi = {
  getAnalytics: (token) =>
    request("/analytics", {
      token,
    }),
};
