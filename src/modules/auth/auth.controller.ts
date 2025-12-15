import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../../shared/utils/jwt.util.js';
import { User } from '@prisma/client';

export const handleGoogleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as User;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Redireciona para o frontend com o token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

export const getProfile = (req: Request, res: Response) => {
  res.json({
    user: req.currentUser,
  });
};

export const logout = (_req: Request, res: Response) => {
  res.json({
    message: 'Logged out successfully',
  });
};