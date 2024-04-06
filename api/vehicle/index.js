const createVehicle = require('./create-vehicles');
const deleteVehicle = require('./delete-vehicles-by-id');
const deleteBatchVehicles = require('./delete-many-vehicles-by-ids');
const updateVehicle = require('./update-vehicles-by-id');
const listVehicle = require('./read-vehicles');
const listVehicleOfUserRequest = require('./read-vehicles-by-request-user');
const detailVehicle = require('./read-vehicles-by-id');
const existVehiclePlate = require('./exist-vehicles-plate');
const updateVehiclePnC = require('./update-vehicles-usePnC-by-ids');
module.exports = {
  createVehicle,
  deleteVehicle,
  updateVehicle,
  listVehicle,
  detailVehicle,
  existVehiclePlate,
  updateVehiclePnC,
  deleteBatchVehicles,
  listVehicleOfUserRequest,
};
