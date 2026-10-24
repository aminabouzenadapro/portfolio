import { useCallback, useEffect, useState } from "react";
import { mockFetch, mockUpload } from "./mock.js";

// Talks to the Node.js API when VITE_API_URL is set (e.g. http://localhost:4000/api),
// otherwise to the in-browser demo API, which answers the same routes with the same JSON.
const API_URL = import.meta.env.VITE_API_URL;
export const DEMO = !API_URL;

const TOKEN_KEY = "cirta-token";
export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } },
};

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function api(path, { method = "GET", body } = {}) {
  const token = tokenStore.get();
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  let status, data;
  if (DEMO) {
    ({ status, data } = await mockFetch(method, path, body, headers));
  } else {
    const res = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    status = res.status;
    data = await res.json().catch(() => ({}));
  }
  if (status >= 400) throw new ApiError(status, data?.error || "Error");
  return data;
}

// Sends a video file (multipart, field "video") and reports progress from 0 to 1
export function upload(path, file, onProgress = () => {}) {
  if (DEMO) {
    return mockUpload(path, file, onProgress, tokenStore.get()).then(({ status, data }) => {
      if (status >= 400) throw new ApiError(status, data?.error || "Error");
      return data;
    });
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL + path);
    const token = tokenStore.get();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      xhr.status >= 400 ? reject(new ApiError(xhr.status, data.error || "Error")) : resolve(data);
    };
    xhr.onerror = () => reject(new ApiError(0, "Network error"));
    const form = new FormData();
    form.append("video", file);
    xhr.send(form);
  });
}

// Loads `path` and reloads when it changes. `data` keeps the last value while reloading.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try { setState({ data: await api(path), error: null, loading: false }); }
    catch (error) { setState({ data: null, error, loading: false }); }
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data })) };
}
