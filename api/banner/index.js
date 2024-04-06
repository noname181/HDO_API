const createBanner = require('./create-banner');
const readBannerById = require('./read-banner-by-id');
const updateBanner = require('./update-banner-by-id');
const updateViewsBanner = require('./update-views-banner-by-id');
const deleteBanner = require('./delete-banner-by-id');
const listBanner = require('./read-banner-model');
const deleteBatchBanner = require('./delete-banner-by-ids');

module.exports = {
  createBanner,
  readBannerById,
  updateBanner,
  deleteBanner,
  listBanner,
  deleteBatchBanner,
  updateViewsBanner,
};
