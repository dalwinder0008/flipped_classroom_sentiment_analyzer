import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  console.log("[Server] Starting server initialization...");
  
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("X-App-Server", "true");
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      uptime: process.uptime(),
      mode: process.env.NODE_ENV || "development"
    });
  });

  // ✅ FIX: setup Vite BEFORE starting server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
    console.log("[Server] Vite middleware initialized");
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ✅ FIX: start server AFTER everything is ready
  app.listen(PORT, "0.0.0.0", () => {
    const url = `http://localhost:${PORT}`;

    console.log("\n===============================");
    console.log(`🚀 Server running at: ${url}`);
    console.log("===============================\n");
  });
}

startServer();