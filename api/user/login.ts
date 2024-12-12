import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../../database/xata';
import { z } from 'zod';
import { hashPassword } from '../../utils/common';
import { loginSchema } from '../../schemas/user';
import { generateTokens } from '../../middleware/jwt';

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
    return res.status(500).json({ message: "Unexpected error", error: error });
  }

  let user;
  try {
    const xata = getXataClient();
    user = await xata.db.user.filter({ cpf: loginData.cpf }).getFirst();

    if (!user || hashPassword(loginData.password, loginData.cpf) !== user.password_hash) {
      return res.status(401).json({ message: "User not found or wrong password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while checking credentials", error: error });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return res.status(200).json({
    user: {
      xata_id: user.xata_id,
      name: user.name,
      social_name: user.social_name,
      status: user.status,
      ubs: user.ubs,
    },
    accessToken,
    refreshToken,
  });
}
