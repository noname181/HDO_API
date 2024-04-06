const createAction = require('./create-trouble');
const readAction = require('./read-trouble-by-id');
const readActionOfRequestUser = require('./read-trouble-of-request-user');
const updateAction = require('./update-trouble-by-id');
const deleteAction = require('./delete-trouble-by-id');
const listAction = require('./read-trouble');
const exportExcelAcction = require('./exportExcel-trouble');
const deleteBatchTrouble = require('./delete-trouble-by-ids');
const readActionDetailOfRequestUser = require('./read-trouble-by-id-of-user-request');
module.exports = {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  exportExcelAcction,
  deleteBatchTrouble,
  readActionOfRequestUser,
  readActionDetailOfRequestUser,
};
