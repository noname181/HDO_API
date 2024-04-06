const createAction = require("./create-notice");
const readAction = require("./read-notice-by-id");
const updateAction = require("./update-notice-by-id");
const deleteAction = require("./delete-notice-by-id");
const listAction = require("./read-notice");
const deleteBatchAction = require("./delete-notice-by-ids");
const readNoticeActive =  require("./read-notice-active");

module.exports = {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  deleteBatchAction,
  readNoticeActive
};
