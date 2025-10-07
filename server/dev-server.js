import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from './index.js';

const app = createServer();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/ping`);
  console.log(`   GET  /api/demo`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/projects`);
  console.log(`   GET  /api/defects`);
  console.log(`   POST /api/defects`);
  console.log(`   GET  /api/stats`);
  console.log(`   GET  /api/defects/export`);
});
