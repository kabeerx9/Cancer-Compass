import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';

import { env } from './config/env-config';
import medicationRoutes from './features/medication/routes/medication.routes';
import patientInfoRoutes from './features/patient-info/routes/patient-info.routes';
import sosMedicineRoutes from './features/sos-medicine/routes/sos-medicine.routes';
import symptomRoutes from './features/symptom/routes/symptom.routes';
import taskRoutes from './features/task/routes/task.routes';
import templateRoutes from './features/template/routes/template.routes';
import userRoutes from './features/user/routes/user.routes';
import { apiErrorHandler, unmatchedRoutes } from './middleware/api-error.middleware';
import { loggerMiddleware, pinoLogger } from './middleware/pino-logger';
// import morgan from 'morgan';
import { hostWhitelist, rateLimiter } from './middleware/security.middleware';

const app: Application = express();

// Trust proxy for rate limiting (fixes X-Forwarded-For header issue)
app.set('trust proxy', true);

// Clerk middleware - must be first to attach auth to every request
app.use(clerkMiddleware());

// Security middleware
// app.use(hostWhitelist);
app.use(rateLimiter);
app.use(helmet());

// Global Middlewares
app.use(express.json());
app.use(cors()); // Enables CORS

// TODO: logger
app.use(loggerMiddleware);
app.use(pinoLogger);
// if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const allowedURLs = env.WHITE_LIST_URLS || [];

app.get('/', hostWhitelist(allowedURLs), (req: Request, res: Response): void => {
  res.json('');
  return;
});

app.get('/heartbeat', (req: Request, res: Response): void => {
  req.log.info('Heartbeat ok');
  res.send('ok');
  return;
});

// API Routes
app.use('/v1/users', userRoutes);
app.use('/v1/medications', medicationRoutes);
app.use('/v1/sos-medicines', sosMedicineRoutes);
app.use('/v1/symptoms', symptomRoutes);
app.use('/v1/tasks', taskRoutes);
app.use('/v1/templates', templateRoutes);
app.use('/v1/patient-info', patientInfoRoutes);

// Error Handling Middleware (Optional)
// For prisma error and other error
app.use(apiErrorHandler);

// Middleware for handling unmatched routes
app.use(unmatchedRoutes);

export { app };
