import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../../database/xata';
import { userSchema } from '../../schemas/user';
import { z } from 'zod';
import { hashPassword } from '../../utils/common';
import { allowCors } from '../../middleware/cors';


export default allowCors(async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  let userData;
  try {
    userData = userSchema.parse(request.body);
    userData.password_hash = hashPassword(userData.password_hash, userData.cpf);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    return response.status(500).json({ message: "Unexpected error", error: error });
  }

  let user;
  try {
    const xata = getXataClient();
    user = await xata.db.user.create(userData);
  } catch (error) {
    return response.status(500).json({ message: "An error occurred while creating the user", error: error });
  }

  return response.status(200).json({ message: "user created successfully", record: user });
});
