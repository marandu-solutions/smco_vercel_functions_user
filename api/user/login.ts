import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loginSchema } from '../../schemas/user';
import { hashPassword } from '../../utils/common';
import { getXataClient } from '../../database/xata';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Validar os dados do login
  let loginData;
  try {
    loginData = loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    return res.status(500).json({ message: "Unexpected error", error });
  }

  let user;
  try {
    const xata = getXataClient();
    user = await xata.db.user.filter({ cpf: loginData.cpf }).getFirst();

    if (!user || hashPassword(loginData.password, loginData.cpf) !== user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error accessing user database", error });
  }

  // Gerar JWT
  const token = jwt.sign({ userId: user.xata_id, name: user.name }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ token });
}
