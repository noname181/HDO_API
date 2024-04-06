const createAction = require('./create-terms');
const readAction = require('./read-terms-by-id');
const updateAction = require('./update-terms-by-id');
const deleteAction = require('./delete-terms-by-id');
const listAction = require('./read-terms');
const deleteBatchAction = require('./delete-terms-by-ids');
const readWithUserAction = require('./read-terms-with-user');
const userReadTermsAction = require('./user-read-terms');
const readWithUserRequireAction = require('./read-terms-with-user-require');
const userReadTermsRequireAction = require('./user-read-terms-require');

module.exports = {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  deleteBatchAction,
  readWithUserAction,
  userReadTermsAction,
  readWithUserRequireAction,
  userReadTermsRequireAction,
};
