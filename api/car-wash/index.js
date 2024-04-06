const createCarWash = require("./create-car-wash");
const readCarWashById = require("./read-car-wash-by-id");
const updateCarWash = require("./update-car-wash-by-id");
const deleteCarWash = require("./delete-car-wash-by-id");
const listCarWash = require("./read-car-wash");
const deleteBatchCarWash = require('./delete-car-wash-by-ids');

module.exports = {
  createCarWash,
  readCarWashById,
  updateCarWash,
  deleteCarWash,
  listCarWash,
  deleteBatchCarWash
};
