import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from "./constants";
import type {
  RegisterPayload,
  LoginPayLoad,
  Session,
  User,
} from "../types/auth";
import type {
  MessageResponse,
  ConversationSummary,
  EncryptedPayload,
} from "../types/message";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // only try to refresh token for non-auth endpoints
  // auth endpoints like login/register don't need token refresh
  const isAuthEndpoint = endpoint.startsWith("/auth");

  if (response.status === 401 && !isAuthEndpoint) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(endpoint, options);
    } else {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || `HTTP error ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  return JSON.parse(userJson) as User;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const session = (await response.json()) as Session;

    saveSession(session);

    return true;
  } catch {
    return false;
  }
}

export async function register(payload: RegisterPayload): Promise<Session> {
  const session = await request<Session>(ENDPOINTS.REGISTER, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveSession(session);

  return session;
}

export async function login(payload: LoginPayLoad): Promise<Session> {
  const session = await request<Session>(ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveSession(session);

  return session;
}

export async function getMe(): Promise<User> {
  return request<User>(ENDPOINTS.ME);
}

export async function logout(): Promise<void> {
  try {
    await request<void>(ENDPOINTS.LOGOUT, { method: "POST" });
  } finally {
    clearSession();
  }
}

export async function searchUsers(query: string): Promise<User[]> {
  return request<User[]>(
    `${ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}`,
  );
}

export async function getUserPublicKey(userId: string): Promise<string> {
  const response = await request<{ public_key: string }>(
    ENDPOINTS.GET_PUBLIC_KEY(userId),
  );
  return response.public_key;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  return request<ConversationSummary[]>(ENDPOINTS.CONVERSATIONS);
}

export async function getMessageHistory(
  userId: string,
): Promise<MessageResponse[]> {
  return request<MessageResponse[]>(ENDPOINTS.HISTORY(userId));
}

export async function sendMessage(
  toUserId: string,
  payload: EncryptedPayload,
): Promise<MessageResponse> {
  return request<MessageResponse>(ENDPOINTS.SEND_MESSAGE, {
    method: "POST",
    body: JSON.stringify({
      to_user_id: toUserId,
      payload,
    }),
  });
} 
