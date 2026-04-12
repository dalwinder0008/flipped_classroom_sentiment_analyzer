import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import net from "net";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to find an available port
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      // Port is busy, try next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function startServer() {
  console.log("[Server] Starting server initialization...");

  const app = express();

  // Find an available port starting from 3000
  const PORT = await findAvailablePort(3000);
  console.log(`[Server] Using port: ${PORT}`);

  app.use(express.json());

  // Mark responses as coming from the actual server
  app.use((req, res, next) => {
    res.setHeader('X-App-Server', 'true');
    next();
  });

  // Health check
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

