import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path'; // Для работы с путями файлов
import { handleDemo } from './routes/demo';
import { createDefect, deleteDefect, exportDefectsCsv, getStats, listDefects, listProjects, listUsers, updateDefect } from './routes/defects';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE || "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Defects management API
  app.get("/api/users", listUsers);
  app.get("/api/projects", listProjects);

  app.get("/api/defects", listDefects);
  app.post("/api/defects", createDefect);
  app.patch("/api/defects/:id", updateDefect);
  app.delete("/api/defects/:id", deleteDefect);

  app.get("/api/defects/export", exportDefectsCsv);
  app.get("/api/defects/stats", getStats);

  // Serve static files from dist/spa (where your React app is built)
  app.use(express.static(path.join(__dirname, '../dist/spa')));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
  });

  return app;
}
