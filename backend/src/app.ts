import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.nodeEnv });
});

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler
app.use(errorHandler);

export default app;
