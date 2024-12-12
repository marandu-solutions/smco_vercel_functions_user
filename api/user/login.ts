import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loginSchema } from '../../schemas/user';
import { hashPassword } from '../../utils/common';
import { getXataClient } from '../../database/xata';
import { UserLoginData } from '../../types/user';
import appConfig from '../../core/app_config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  let loginData;
  try {
    loginData = loginSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    return res.status(500).json({ message: "Unexpected error", error });
  }

  let user: UserLoginData | null = null;

  try {
    const xata = getXataClient();
    user = await xata.db.user.select(
      ["id", "name", "ubs.xata_id", "password_hash"]
    ).filter({ cpf: loginData.cpf }).getFirst();

    if (!user || hashPassword(loginData.password, loginData.cpf) !== user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error accessing user database", error });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, ubs: user.ubs.id },
    appConfig.jwt.secretKey,
    { expiresIn: "10h" }
  );

  return res.status(200).json({ token });
}
