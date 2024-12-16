import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loginSchema } from '../../schemas/user';
import { hashPassword } from '../../utils/common';
import { getXataClient } from '../../database/xata';
import { UserLoginData } from '../../types/user';
import appConfig from '../../core/app_config';
import { allowCors } from '../../middleware/cors';


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  let loginData;
  try {
    loginData = loginSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    return response.status(500).json({ message: "Unexpected error", error });
  }

  let user;
  try {
    const xata = getXataClient();
    user = await xata.db.user.select(
      ["xata_id", "name", "ubs.xata_id", "password_hash", "profile"]
    ).filter({ cpf: loginData.cpf }).getFirst();

    if (!user || hashPassword(loginData.password, loginData.cpf) !== user.password_hash) {
      return response.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return response.status(500).json({ message: "Error accessing user database", error });
  }

  const token = jwt.sign(
    { id: user.xata_id, name: user.name, ubs: user.ubs.xata_id, profile: user.profile },
    appConfig.jwt.secretKey,
    { expiresIn: "10h" }
  );

  return response.status(200).json({ token });
});
