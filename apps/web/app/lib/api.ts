/**
 * Resolves the backend API base URL.
 * Automatically defaults to the live Render backend when deployed to production,
 * and localhost:8000 when running locally.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "https://call-hifi.onrender.com";
    }
  }
  return "http://localhost:8000";
}
