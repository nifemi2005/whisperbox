export const API_BASE_URL = "https://whisperbox.koyeb.app";

export const ENDPOINTS = {
  //Create new account
  REGISTER: "/auth/register",

  //Login to existing account
  LOGIN: "auth/login",

  //Get the currently logged in user's profile
  ME: "auth/me",

  //Get a new access token using the refresh token
  REFRESH: "/auth/refresh",

  //Log out and invalidate the session
  LOGOUT: "/auth/logout",

  //Search for other users to message
  SEARCH_USERS: "/users/search",

  //Get a user public key
  GET_PUBLIC_KEY: (userId: string) => `/users/${userId}/public-key`,

  CONVERSATIONS: "/messages/conversations",

  HISTORY: (userId: string) => `/messages/history/${userId}`,

  SEND_MESSAGE: "/messages/send",

  HEALTH: "/health",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "wb_access_token",

  REFRESH_TOKEN: "wb_refresh_token",

  USER: "wb_user",
} as const;

export const CRYPTO_CONFIG = {
  RSA_KEY_SIZE: 2048,
  RSA_HASH: "SHA-256",
  AES_IV_LENGTH: 12,
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_HASH: "SHA-256",
  PBKDF2_SALT_LENGTH: 16,
} as const;

export const INDEXEDDB_CONFIG = {
  DB_NAME: "whisperbox_keys",
  DB_VERSION: 1,
  STORE_NAME: "private_keys",
} as const;
