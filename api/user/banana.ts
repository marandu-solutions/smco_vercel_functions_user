import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidateJwt } from '../../middleware/jwt';

class MyRoutes {
  @ValidateJwt(['POST'])
  async myProtectedRoute(req: VercelRequest, res: VercelResponse) {
    return res.status(200).json({
      message: 'You have access to this route',
      user: req.user,  // Usuário autenticado com base no JWT
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const routes = new MyRoutes();

  if (req.url === '/protected') {
    return routes.myProtectedRoute(req, res);
  }
  res.status(404).json({ message: 'Route not found' });
}
