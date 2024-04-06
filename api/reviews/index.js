const updateReview = require('./update-review-by-id');
const listReview = require('./read-review');
const detailReview = require('./read-review-by-id');
const createReview = require('./create-review');
const deleteReview = require('./delete-review-by-id');
const deleteMultiReview = require('./delete-review-by-ids');
const userDeleteMultiReview = require('./user-delete-review-by-ids');
module.exports = {
  updateReview,
  listReview,
  detailReview,
  createReview,
  deleteReview,
  deleteMultiReview,
  userDeleteMultiReview,
};
