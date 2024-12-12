import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { UserJwt } from '../types/user';
import appConfig from '../core/app_config';

export function validateJWT(req: VercelRequest, res: VercelResponse, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secretKey) as UserJwt;
    next(decoded);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
}
