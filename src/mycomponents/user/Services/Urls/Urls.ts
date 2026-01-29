// src/mycomponents/user/Services/Urls/Urls.ts
import axios from "axios";

export const publicAxiosInstance = axios.create({
  baseURL: "https://akhdar-erp-dev.vercel.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});