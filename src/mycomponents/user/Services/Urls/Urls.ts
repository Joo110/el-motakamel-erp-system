// src/mycomponents/user/Services/Urls/Urls.ts
import axios from "axios";

export const publicAxiosInstance = axios.create({
  baseURL: "https://erp-3-5mq8.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});