import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util.js';
import { AppError } from './error.middleware.js';

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid token', 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.currentUser = payload;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};