import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import columnRoutes from './routes/column.routes';
import cardRoutes from './routes/card.routes';
import cardController from './controllers/card.controller';
import { authenticate } from './middleware/auth.middleware';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN.split(',').map(url => url.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kanny Kanban API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', columnRoutes); // Columns nested under boards
app.use('/api/cards', cardRoutes); // Cards at /api/cards/:id

// Create card route (nested under columns)
app.post('/api/columns/:columnId/cards', authenticate, cardController.createCard.bind(cardController));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Request error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const HOST = process.env.HOST || '0.0.0.0';

// Only start the HTTP server outside of test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), HOST, () => {
    logger.info(`Server is running on http://${HOST}:${PORT}`);
    logger.info(`CORS enabled for: ${CORS_ORIGIN}`);
  });
}

export default app;
