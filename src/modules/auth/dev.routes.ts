import { Router } from 'express';
import { prisma } from '../../config/database.js';
import { generateToken } from '../../shared/utils/jwt.util.js';
import { env } from '../../config/env.js';

const router = Router();

// ⚠️ APENAS PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
if (env.NODE_ENV === 'development') {
  router.post('/dev/token', async (req, res, next) => {
    try {
      const { email = 'dev@example.com', name = 'Dev User' } = req.body;

      // Cria ou busca usuário de dev
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: `dev-${Date.now()}`,
            email,
            name,
            avatarUrl: null,
          },
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  });
}

export default router;