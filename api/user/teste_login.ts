import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateJWT } from '../../middleware/jwt';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "banana" });
  }

  validateJWT(req, res, () => {
    return res.status(200).json({ message: "Hello World" });
  });
}