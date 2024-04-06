/**
 * Created by Jackie Yoon on 2023-08-04.
 * 비회원 단가, 회원 단가, 미출차 보증금 OCPP 전송
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");

module.exports = {
  path: ["/charger-price/:cl_id"],
  method: "get",
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const cl_id = _request.params.cl_id;
  try {
    // Config 테이블 조회
    const configs = await models.Config.findAll({
      attributes: {
        include: ["divCode", "cfgVal"],
      },
    });

    let defaultUnitPrice = null;
    let memberDisc = null;
    let parkDeposit = null; // 미출차 보증금

    for (let config of configs) {
      if (config.divCode === "DEFAULT_UNITPRICE") defaultUnitPrice = parseInt(config.cfgVal);
      else if (config.divCode === "MEMBER_DISC") memberDisc = parseInt(config.cfgVal);
      else if (config.divCode === "PARK_DEPOSIT") parkDeposit = parseInt(config.cfgVal);
    }

    if (defaultUnitPrice === null) throw "NOT_EXIST_DEFAULT_UNIT_PRICE";
    if (memberDisc === null) throw "NOT_EXIST_MEMBER_DISC";
    if (parkDeposit === null) throw "NOT_EXIST_PARK_DEPOSIT";

    // 비회원 단가 조회
    const nonMemberPriceTemp = await models.sequelize.query(
      `SELECT Fn_Get_Now_Price_Charger(${cl_id}) as 'non_member_price'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const nonMemberPrice = parseInt(nonMemberPriceTemp[0].non_member_price);

    // 회원 단가 조회
    const memberPrice = nonMemberPrice - memberDisc;

    // 비회원 단가: non-member_price
    // 회원 단가: member_price
    // 미출차 보증금: park_deposit
    _response.json({
      "non-member_price": nonMemberPrice,
      member_price: memberPrice,
      park_deposit: parkDeposit,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === "NOT_EXIST_DEFAULT_UNIT_PRICE") {
    _response.error.notFound(_error, "기본 단가를 불러올 수 없습니다.");
    return;
  }

  if (_error === "NOT_EXIST_MEMBER_DISC") {
    _response.error.notFound(_error, "회원 할인가를 불러올 수 없습니다.");
    return;
  }

  if (_error === "NOT_EXIST_PARK_DEPOSIT") {
    _response.error.notFound(_error, "미출차 보증금을 불러올 수 없습니다.");
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
