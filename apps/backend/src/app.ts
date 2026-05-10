import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// 1. Global Middlewares
app.use(helmet()); // Adds basic HTTP security headers
app.use(cors());
app.use(express.json()); // Parses incoming JSON
app.use(morgan('dev')); // Logging

// 2. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 3. TODO: Placeholder for routes
// app.use('/api/auth', authRoutes);
// app.use('/api/vault', vaultRoutes);

export default app;
