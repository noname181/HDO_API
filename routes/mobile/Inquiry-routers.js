const router = require("express").Router();
const { createInquiry, deleteInquiry, readInquiry, readInquiryById,updateInquiry, deleteBatchAction } = require("../../api/Inquiry");

const { configuration } = require("../../config/config");
const { TokenService } = require("../../util/tokenService");
const { AuthMiddleware } = require("../../middleware/auth.middleware");
const { RoleMiddleware } = require("../../middleware/role.middleware");

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();


router.post(
    "/inquiry",
    authMiddleware.checkToken(createInquiry.checkToken),
    roleMiddleware.checkRoles(createInquiry.roles),
    createInquiry.validator,
    createInquiry.service,
    createInquiry.errorHandler
);

router.get(
    "/inquiry",
    authMiddleware.checkToken(readInquiry.checkToken),
    roleMiddleware.checkRoles(readInquiry.roles),
    readInquiry.validator,
    readInquiry.service,
    readInquiry.errorHandler
);
router.put(
    "/inquiry/:id",
    authMiddleware.checkToken(updateInquiry.checkToken),
    roleMiddleware.checkRoles(updateInquiry.roles),
    updateInquiry.validator,
    updateInquiry.service,
    updateInquiry.errorHandler
);
router.get(
    "/inquiry/:id",
    authMiddleware.checkToken(readInquiryById.checkToken),
    roleMiddleware.checkRoles(readInquiryById.roles),
    readInquiryById.validator,
    readInquiryById.service,
    readInquiryById.errorHandler
);
router.delete(
    deleteBatchAction.path,
    authMiddleware.checkToken(deleteBatchAction.checkToken),
    roleMiddleware.checkRoles(deleteBatchAction.roles),
    deleteBatchAction.validator,
    deleteBatchAction.service,
    deleteBatchAction.errorHandler
);
router.delete(
    "/inquiry/:id",
    authMiddleware.checkToken(deleteInquiry.checkToken),
    roleMiddleware.checkRoles(deleteInquiry.roles),
    deleteInquiry.validator,
    deleteInquiry.service,
    deleteInquiry.errorHandler
);

module.exports = router;
