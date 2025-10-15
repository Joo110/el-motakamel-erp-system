
import axios from "axios";
export const baseUrl = "http://192.168.1.20:5000/api/v1";
// export const Photo_baseUrl = "http://192.168.1.18:8000/";

//public    Dont need Token
export const publicAxiosInstance = axios.create({
  baseURL: baseUrl,
});

// private   need Token after login
export const privateAxiosInstance = axios.create({
  baseURL: baseUrl,
});

privateAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
