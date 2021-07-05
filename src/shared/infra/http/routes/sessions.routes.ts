import { Router } from 'express';

import { AuthenticateUserController } from '@modules/accounts/useCases/AuthenticateUser/AuthenticateUserController';
import { RefreshTokenController } from '@modules/accounts/useCases/RefreshToken/RefreshTokenController';

const sessionsRoutes = Router();

const authenticateUserController = new AuthenticateUserController();
const refreshTokenController = new RefreshTokenController();

sessionsRoutes.post('/', authenticateUserController.handle);

sessionsRoutes.post('/refresh-token', refreshTokenController.handle);

export { sessionsRoutes };
