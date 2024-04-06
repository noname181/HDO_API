const router = require('express').Router();
const {
  updateReview,
  listReview,
  detailReview,
  createReview,
  deleteReview,
  deleteMultiReview,
  userDeleteMultiReview,
} = require('../../api/reviews');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

router.get(
  '/review',
  authMiddleware.checkToken(listReview.checkToken),
  roleMiddleware.checkRoles(listReview.roles),
  listReview.validator,
  listReview.service,
  listReview.errorHandler
);
router.put(
  '/review/:id',
  authMiddleware.checkToken(updateReview.checkToken),
  roleMiddleware.checkRoles(updateReview.roles),
  updateReview.validator,
  updateReview.service,
  updateReview.errorHandler
);
router.get(
  '/review/:id',
  authMiddleware.checkToken(detailReview.checkToken),
  roleMiddleware.checkRoles(detailReview.roles),
  detailReview.validator,
  detailReview.service,
  detailReview.errorHandler
);
router.delete(
  '/review/user',
  authMiddleware.checkToken(userDeleteMultiReview.checkToken),
  roleMiddleware.checkRoles(userDeleteMultiReview.roles),
  userDeleteMultiReview.validator,
  userDeleteMultiReview.service,
  userDeleteMultiReview.errorHandler
);
router.delete(
  '/review/:id',
  authMiddleware.checkToken(deleteReview.checkToken),
  roleMiddleware.checkRoles(deleteReview.roles),
  deleteReview.validator,
  deleteReview.service,
  deleteReview.errorHandler
);
router.delete(
  '/review',
  authMiddleware.checkToken(deleteMultiReview.checkToken),
  roleMiddleware.checkRoles(deleteMultiReview.roles),
  deleteMultiReview.validator,
  deleteMultiReview.service,
  deleteMultiReview.errorHandler
);
router.post(
  '/review',
  authMiddleware.checkToken(createReview.checkToken),
  roleMiddleware.checkRoles(createReview.roles),
  createReview.validator,
  createReview.service,
  createReview.errorHandler
);
module.exports = router;
