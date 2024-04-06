const createAction = require('./create-ms-template');
const deleteByIdAction = require('./delete-ms-template-by-id');
const deleteByIdsAction = require('./delete-ms-template-by-ids');
const updateAction = require('./update-ms-template');
const readAction = require('./read-ms-template');
const readByIdAction = require('./read-ms-template-by-id');

module.exports = {
  createAction,
  deleteByIdAction,
  deleteByIdsAction,
  updateAction,
  readAction,
  readByIdAction,
};
