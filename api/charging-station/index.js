'use strict';
const chargingStationPrice = require('./read-charging-station-price-by-id');
const deleteChargerStationByIds = require('./delete-charger-station-by-ids');
const readChargingStationByOrg = require('./read-charging-station-by-org');
module.exports = {
  chargingStationPrice,
  deleteChargerStationByIds,
  readChargingStationByOrg,
};
