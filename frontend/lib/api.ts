import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ff_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ff_token");
      localStorage.removeItem("ff_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authRegister = (d: any) => api.post("/api/v1/auth/register", d);
export const authLogin = (d: any) => api.post("/api/v1/auth/login", d);
export const authMe = () => api.get("/api/v1/auth/me");

// Audit
export const auditCalculate = (d: any) => api.post("/api/v1/audit/calculate", d);
export const auditAdvisory = (d: any) => api.post("/api/v1/audit/advisory", d);
export const auditHistory = () => api.get("/api/v1/audit/history");
export const auditGet = (id: number) => api.get(`/api/v1/audit/${id}`);

// Feed
export const feedGet = (skip = 0, limit = 20) =>
  api.get(`/api/v1/feed?skip=${skip}&limit=${limit}`);
export const feedPublish = (d: any) => api.post("/api/v1/feed/publish", d);
export const uploadVideo = (formData: FormData) =>
  api.post("/api/v1/feed/upload-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// AI CFO Agent
export const aiAgentChat = (message: string, history?: Array<{role: string; content: string}>) =>
  api.post("/api/v1/ai-agent/chat", { message, history });

// Document extraction
export const extractFinancialDocument = (formData: FormData) =>
  api.post("/api/v1/audit/extract-document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Admin
export const adminUsers = () => api.get("/api/v1/admin/users");
export const adminStats = () => api.get("/api/v1/admin/stats");
export const adminToggleUser = (id: number) =>
  api.patch(`/api/v1/admin/users/${id}/status`);
export const adminUpdateTax = (id: number, status: string) =>
  api.patch(`/api/v1/admin/users/${id}/tax-status?tax_status=${status}`);
export const adminSaveGemini = () =>
  api.post("/api/v1/admin/gemini-key");
export const adminGetGemini = () => api.get("/api/v1/admin/gemini-key");
