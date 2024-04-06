/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const {
  addressMask,
  phoneNoMask,
  emailMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: '/orgs/:orgId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.read],
  status: 'PRIVATE',
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { privateView = false } = _request;
  const orgId = _request.params.orgId;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      {
        model: models.sb_charging_station,
        as: 'chargingStation',
        attributes: ['chgs_id'],
      },
    ],
    attributes: [
      'id',
      'category',
      'fullname',
      'name',
      'bizRegNo',
      'address',
      'contactName',
      'contactPhoneNo',
      'contactEmail',
      'deductType',
      'discountPrice',
      'staticUnitPrice',
      'payMethodId',
      'isPayLater',
      'isLocked',
      'billingDate',
      'closed',
      'area',
      'branch',
      'haveCarWash',
      'haveCVS',
      'STN_STN_SEQ',
      'STN_STN_ID',
      'STN_STN_GUBUN',
      'STN_CUST_NO',
      'STN_ASSGN_AREA_GUBUN',
      'STN_COST_CT',
      'STN_PAL_CT',
      'STN_STN_SHORT_NM',
      'erp',
      'createdAt',
      'updatedAt',
      [
        models.sequelize.literal(
          `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
        ),
        'branchName',
      ],
      [
        models.sequelize.literal(
          "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
        ),
        'areaName',
      ],
    ],
  };

  try {
    if (!orgId) throw 'NO_ORG_ID';

    const org = await models.Org.findByPk(orgId, option);
    if (!org) throw 'NOT_EXIST_ORG';

    if (!privateView) {
      const address = addressMask(org.dataValues.address);
      const phoneNo = phoneNoMask(org.dataValues.contactPhoneNo);
      const email = emailMask(org.dataValues.contactEmail);
      org.dataValues = {
        ...org.dataValues,
        address,
        contactPhoneNo: phoneNo,
        contactEmail: email,
      };
    }

    _response.json({
      result: org,
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

  if (_error === 'NO_ORG_ID') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_ORG') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
