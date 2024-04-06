const createInquiry = require('./create-Inquiry');
const deleteInquiry = require('./delete-inquiry-by-id');
const readInquiry = require('./read-Inquiry');
const readInquiryById = require('./read-Inquiry-by-id');
const updateInquiry = require('./update-Inquiry-by-id');
const deleteBatchAction = require('./delete-inquiry-by-ids');
module.exports = {
  createInquiry,
  deleteInquiry,
  readInquiry,
  readInquiryById,
  updateInquiry,
  deleteBatchAction,
};
