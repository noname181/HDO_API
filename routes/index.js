const router = require('express').Router();

const webRoutes = require('./web');
const mobileRoutes = require('./mobile');
const ocppRoutes = require('./ocpp');

router.use('/v1', webRoutes);
router.use('/v1', mobileRoutes);
router.use('/v1', ocppRoutes);

module.exports = router;
