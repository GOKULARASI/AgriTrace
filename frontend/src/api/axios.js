// src/api/axios.js

import axios from "axios";

// 👉 IMPORTANT: include /api here
const rawBase = import.meta.env.VITE_API_URL || "https://agritrace-2qjx.onrender.com";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/$/, "")}/api`;

console.log("API_BASE =", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 Attach token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;