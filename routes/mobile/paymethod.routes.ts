import { Router, Request, Response, NextFunction } from 'express';

import { default as preregister } from '../../api/paymethod/preregister-credit';
import { default as register } from '../../api/paymethod/register-credit';
import { configuration } from '../../config/config';
import { TokenService } from '../../util/tokenService';

// @ts-ignore
import { AuthMiddleware } from '../../middleware/auth.middleware';
// @ts-ignore
import { RoleMiddleware } from '../../middleware/role.middleware';

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

const router = Router();

/**
 * `liftToken` sets `'Authorization'` token to value from request body
 * `.shopValueInfo.value1` as we can't controll POST request header
 * that's caused by EasyPay page.
 */
function liftToken(req: Request, _arg1: Response, next: NextFunction) {
  if (req.headers['authorization']) {
    next();
    return;
  }

  const token = req.body.shopValue1 ?? null;
  if (req.body.shopValue1) req.headers['authorization'] = token;
  next();
}

router.get(
  preregister.path,
  authMiddleware.checkToken(preregister.checkToken),
  roleMiddleware.checkRoles(preregister.roles),
  preregister.validator,
  preregister.service,
  preregister.errorHandler
);

router.post(
  register.path,
  liftToken,
  authMiddleware.checkToken(register.checkToken),
  roleMiddleware.checkRoles(register.roles),
  register.validator,
  register.service,
  register.errorHandler
);

// TODO
module.exports = router;
