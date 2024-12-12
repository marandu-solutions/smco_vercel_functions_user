import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";

export function validateJWT(req: VercelRequest, res: VercelResponse, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    (req as any).user = decoded; // Adicionar o usuário decodificado ao objeto da requisição
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error });
  }
}
