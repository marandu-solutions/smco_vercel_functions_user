import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { UserJwt } from '../types/user';
import appConfig from '../core/app_config';

export function validateJWT(request: VercelRequest, response: VercelResponse, route: Function) {
  const authHeader = request.headers.authorization;
  if (!(authHeader?.startsWith("Bearer "))) {
    return response.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secretKey) as UserJwt;
    route(decoded);
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token", error });
  }
}
