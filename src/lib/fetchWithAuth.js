let isRefreshing = false;
let refreshPromise = null;

function getTokens() {
  return {
    accessToken: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  window.dispatchEvent(new Event("auth-change"));
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("auth-change"));
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch("/api/v1/users/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Session expired");
  }

  const data = await response.json();
  setTokens(data.token, data.refreshToken);
  return data.token;
}

/**
 * A fetch wrapper that automatically attaches the access token and
 * retries the request once after refreshing the token on a 401 response.
 *
 * Usage:
 *   const response = await fetchWithAuth("/api/v1/users/me");
 *   const response = await fetchWithAuth("/api/v1/reviews", { method: "POST", body: ... });
 */
export async function fetchWithAuth(url, options = {}) {
  const { accessToken, refreshToken } = getTokens();

  // No access token — try to refresh if we have a refresh token
  if (!accessToken) {
    if (!refreshToken) {
      clearTokens();
      throw new AuthExpiredError();
    }

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      const newAccessToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      return fetch(url, { ...options, headers });
    } catch {
      isRefreshing = false;
      refreshPromise = null;
      clearTokens();
      throw new AuthExpiredError();
    }
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await fetch(url, { ...options, headers });

  if (response.status !== 401) {
    return response;
  }

  // Token expired — try to refresh (only one refresh at a time)
  try {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const newAccessToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };
    return fetch(url, { ...options, headers: retryHeaders });
  } catch {
    isRefreshing = false;
    refreshPromise = null;
    clearTokens();
    throw new AuthExpiredError();
  }
}

/**
 * Custom error class so pages can check if the error is an expired session
 * and redirect to the login page.
 */
export class AuthExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "AuthExpiredError";
  }
}

/**
 * Returns true if the user has any valid auth tokens (access or refresh).
 * Use this in auth guards instead of checking only for the access token.
 */
function isAuthenticated() {
  const { accessToken, refreshToken } = getTokens();
  return Boolean(accessToken || refreshToken);
}

export { getTokens, setTokens, clearTokens, isAuthenticated };
