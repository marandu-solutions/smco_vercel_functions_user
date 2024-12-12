import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { UserJwt } from '../types/user';
import appConfig from '../core/app_config';

const ALLOWED_ORIGINS = ["http://localhost:55963"];

export function validateJWT(req: VercelRequest, res: VercelResponse, next: Function) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.join(","));
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, PATCH, DELETE, POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.status(200).end();
  }

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
