"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const axios = require("axios");
const { getStationDataAndModifyNew } = require('../../api/task/getStationDataAndModifyNew');

module.exports = {
  path: ["/test-env-fetch"],
  method: "get",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    await getStationDataAndModifyNew();
    _response.json({
      result: "실행완료",
    });
  } catch (e) {
    _response.json({
      result: e?.stack,
    });
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}

