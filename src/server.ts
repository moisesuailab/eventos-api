import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { passport } from './config/passport.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import devRoutes from './modules/auth/dev.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import guestsRoutes from './modules/guests/guests.routes.js';
import checkinRoutes from './modules/checkin/checkin.routes.js';

const app = express();
const PORT = env.PORT;

// Middlewares
app.use(cors({
  origin: [
    env.FRONTEND_URL,
    'http://192.168.2.60:5173',
],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica se a API está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV 
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Convite Criativo - API Docs',
}));

// Routes
app.use('/auth', authRoutes);
app.use('/auth', devRoutes);
app.use('/events', eventsRoutes);
app.use('/guests', guestsRoutes);
app.use('/checkin', checkinRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend: ${env.FRONTEND_URL}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});