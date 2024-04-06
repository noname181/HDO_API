"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const bodyParser = require("body-parser"); // body-parser 모듈 추가

module.exports = {
  path: ["/init-qr"],
  method: "get",
  checkToken: false, // default true
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const chg_id = _request.query.chg_id
    const charger = await models.sb_charger.findByPk(chg_id, {
      attributes: {
        exclude: ["deletedAt"],
      },
    });
    if (!charger) throw "NOT_EXIST_CHARGER";
    const data = charger.dataValues
    console.log("넘기기전데이터", data)
    _response.render("temporary_qr_url.ejs", {data});
    return

  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === "RETRIEVE_CONFIG_FAILED") {
    _response.error.notFound(_error, "설정(CONFIG)값 조회에 실패하였습니다.");
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}