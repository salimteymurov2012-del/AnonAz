import { API_URL } from "./config";
const API = API_URL;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("anonaz-token");
}

function setToken(token: string) {
  localStorage.setItem("anonaz-token", token);
}

function clearToken() {
  localStorage.removeItem("anonaz-token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data: { username: string; password: string; gender?: string; age?: number; city?: string; district?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }).then((res) => {
      setToken(res.token);
      return res;
    }),

  login: (data: { username: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }).then((res) => {
      setToken(res.token);
      return res;
    }),

  logout: () => {
    clearToken();
  },

  getToken,
  clearToken,

  // Users
  getMe: () => request("/users/me"),
  updateMe: (data: any) => request("/users/me", { method: "PUT", body: JSON.stringify(data) }),
  getUsers: () => request("/users"),
  getOnlineUsers: () => request("/users/online"),
  searchUsers: (params: string) => request(`/users/search${params}`),
  getUser: (username: string) => request(`/users/${username}`),

  // Messages
  getConversations: () => request("/messages/conversations/list"),
  getMessages: (userId: number) => request(`/messages/${userId}`),

  // Valentines
  sendValentine: (data: { toUsername: string; text: string }) =>
    request("/valentines/send", { method: "POST", body: JSON.stringify(data) }),
  getReceivedValentines: () => request("/valentines/received"),
  getSentValentines: () => request("/valentines/sent"),
  acceptValentine: (id: number) => request(`/valentines/${id}/accept`, { method: "PUT" }),
  rejectValentine: (id: number) => request(`/valentines/${id}/reject`, { method: "PUT" }),

  // Reports
  sendReport: (data: { targetUsername: string; reason: string }) =>
    request("/reports", { method: "POST", body: JSON.stringify(data) }),

  // Favorites
  getFavorites: () => request("/favorites"),
  toggleFavorite: (targetId: number) => request(`/favorites/${targetId}`, { method: "POST" }),

  // Admin
  getAdminStats: () => request("/admin/stats"),
  getAdminUsers: () => request("/admin/users"),
  blockUser: (id: number) => request(`/admin/users/${id}/block`, { method: "PUT" }),
  unblockUser: (id: number) => request(`/admin/users/${id}/unblock`, { method: "PUT" }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: "DELETE" }),
  getAdminReports: () => request("/admin/reports"),
  resolveReport: (id: number) => request(`/admin/reports/${id}/resolve`, { method: "PUT" }),
};
