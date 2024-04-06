const router = require("express").Router();
const ocppRouters = require("./ocpp-routes");
router.use(ocppRouters);
module.exports = router;