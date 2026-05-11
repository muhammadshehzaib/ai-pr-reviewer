import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import webhookRoutes from './routes/webhook.routes';
import authRoutes from './routes/auth.routes';
import vaultRoutes from './routes/vault.routes';
import repositoryRoutes from './routes/repository.routes';

const app: Application = express();

// 1. Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// 2. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 3. Route Wireframe
app.use('/api/webhooks', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/repositories', repositoryRoutes);

export default app;
