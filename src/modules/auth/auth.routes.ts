import { Router } from 'express';
import { passport } from '../../config/passport.js';
import { handleGoogleCallback, getProfile, logout } from './auth.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Iniciar autenticação com Google
 *     description: Redireciona para página de login do Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirecionamento para Google OAuth
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback do Google OAuth
 *     description: Recebe resposta do Google e gera token JWT
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redireciona para frontend com token
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  handleGoogleCallback
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/profile', authenticate, getProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', authenticate, logout);

export default router;