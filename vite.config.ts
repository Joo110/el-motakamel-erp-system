import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://akhdar-erp-dev.vercel.app", // بدل القديم
        changeOrigin: true,
        // ممكن تشيل الـ rewrite خالص لأن /api/v1 موجودة بالفعل
      },
    },
  },
})
