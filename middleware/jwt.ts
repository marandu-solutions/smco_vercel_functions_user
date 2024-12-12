import appConfig from '../core/app_config';
import jwt from 'jsonwebtoken';
import { VercelRequest, VercelResponse } from '@vercel/node';

export function ValidateJwt(validMethods: string[]) {
  return function(descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(req: VercelRequest, res: VercelResponse) {
      if (!validMethods.includes(req.method || '')) {
        return res.status(405).json({ message: 'Method Not Allowed' });
      }

      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token missing' });
      }

      try {
        const decoded = jwt.verify(token, appConfig.jwt.secretKey);
        req.user = decoded;
        return originalMethod.apply(this, [req, res]);
      } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error });
      }
    };
  };
}

export function generateTokens(user: any) {
  const payload = {
    xata_id: user.xata_id,
    name: user.name,
    social_name: user.social_name,
    status: user.status,
    ubs: user.ubs,
  };

  const accessToken = jwt.sign(payload, appConfig.jwt.secretKey, { expiresIn: '1h' });

  const refreshToken = jwt.sign(payload, appConfig.jwt.secretKey, { expiresIn: '1d' });

  return { accessToken, refreshToken };
}