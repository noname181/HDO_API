const createAction = require("./create-faq");
const readAction = require("./read-faq-by-id");
const updateAction = require("./update-faq-by-id");
const deleteAction = require("./delete-faq-by-id");
const listAction = require("./read-faqs");
const deleteBatchAction = require('./delete-faq-by-ids');

module.exports = {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  deleteBatchAction
};
