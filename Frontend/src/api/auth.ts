import API from "./axios";

export type Role = "dealership" | "salesperson";

const TOKEN_KEY = "deales_token";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete API.defaults.headers.common["Authorization"];
}

export async function register(params: {
  email: string;
  password: string;
  role: Role;
}) {
  const { email, password, role } = params;
  const res = await API.post("/auth/register", { email, password, role });
  return res.data;
}

export async function login(params: {
  email: string;
  password: string;
  role: Role;
}) {
  const { email, password, role } = params;

  const res = await API.post("/auth/login", { email, password, role });

  const token: string | undefined = res.data?.access_token;
  if (!token) {
    throw new Error("No access_token returned from server");
  }

  setToken(token);
  return token;
}

export async function me() {
  const res = await API.get("/auth/me");
  return res.data;
}

/**
 * Call this once when the app loads
 * to restore auth header from localStorage.
 */
export function hydrateAuthFromStorage() {
  const token = getToken();
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}