import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) return "lucide";
            if (id.includes("react-router")) return "router";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor") || id.includes("react-smooth") || id.includes("react-transition-group")) return "charts";
            if (id.includes("react-hot-toast")) return "toast";
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) return "react";
            return "vendor";
          }
        }
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
