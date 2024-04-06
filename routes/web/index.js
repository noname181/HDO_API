const router = require('express').Router();

const faqRoutes = require('./faq-routes');
const pointRoutes = require('./point-routes');

const noticeRoutes = require('./notice-routes');
const couponRoutes = require('./coupon-routes');
const organizationRouters = require('./organization.router');

const bannerRouters = require('./banner-routes');
const bookingRoutes = require('./booking-routes');
const paymentRoutes = require('./payment.routes');
const troubleRoutes = require('./trouble-routes');
const carWashRoute = require('./car-wash-routes');
const authRouters = require('./auth.routers');
const unitPriceSetRoute = require('./unit-price-route');
const configRoutes = require('./config-routes');
const userRoutes = require('./user.routes');
const termsRoutes = require('./terms-routes');
const orgRouters = require('./org.routes');
const chargingStationRouters = require('./charging-station-routes');
const { permissionRoutes } = require('./permission.routes');
const chargerHistoryRouters = require('./charger-history-routes');
const consultationRoutes = require('./consultation.routes');
const sapPersonRoutes = require('./sap-person-routes');
const paymentNotificationsRoutes = require('./payment-notifications-routes');
const messageLogsRoutes = require('./message-logs-routes');
const settlementRoutes = require('./settlement-routes');
const msTemplateRoutes = require('./ms-template-routes');
const chargerStatusHistoryRoutes = require('./charger-status-hisotry-routes');
const vehicleRoutes = require('./vehicles-routes');
const batchLogRoutes = require('./batch-log-routes');
const webNoticeRoute = require('./web-notice-routes');
const afterActionRoute = require('./after-action-routes');
const { logsRoutes } = require('./logs.routes');

router.use(faqRoutes);
router.use(pointRoutes);
router.use(bannerRouters);
router.use(noticeRoutes);
router.use(couponRoutes);
router.use(organizationRouters);
router.use(bookingRoutes);
router.use(paymentRoutes);
router.use(troubleRoutes);
router.use(carWashRoute);
router.use(authRouters);
router.use(unitPriceSetRoute);
router.use(userRoutes);
router.use(configRoutes);
router.use(termsRoutes);
router.use(orgRouters);
router.use(chargingStationRouters);
router.use(permissionRoutes());
router.use(chargerHistoryRouters);
router.use(consultationRoutes);
router.use(sapPersonRoutes);
router.use(paymentNotificationsRoutes);
router.use(messageLogsRoutes);
router.use(settlementRoutes);
router.use(msTemplateRoutes);
router.use(chargerStatusHistoryRoutes);
router.use(vehicleRoutes);
router.use(batchLogRoutes);
router.use(webNoticeRoute);
router.use(afterActionRoute);
router.use(logsRoutes());

module.exports = router;
