const createAction = require("./create-coupon");
const readAction = require("./read-coupon-by-id");
const updateAction = require("./update-coupon-by-id");
const deleteAction = require("./delete-coupon-by-id");
const listAction = require("./read-coupon-model");

module.exports = {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
};
