'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const moment = require('moment');

module.exports = {
  path: ['/unit-price-reservation'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    let { body } = _request;
    body.createdAt = body.updatedAt = new Date();

    body.createdWho = _request.user.id;
    body.updatedWho = _request.user.id;
    
    if (moment().tz("Asia/Seoul").isAfter(moment(body.date, 'YYYY-MM-DD HH:mm:ss'))) {
      throw 'INVALID_DATE'
    }
 
    const bodyDate = moment(body.date, 'YYYY-MM-DD HH:mm:ss');
 
    if (moment().tz("Asia/Seoul").isAfter(bodyDate) || (bodyDate.minutes() % 10 !== 0 && bodyDate.minutes() % 10 !== 5)) {
      throw 'INVALID_DATE';
    }
  
    const existedInstance = await models.sb_unitprice_change_reservation.findOne({
      where: {
        chargerId: body.chargerId,
        date: formatYmdHi(body.date),
      }
    })
    if(existedInstance){
      throw 'DUPLICATED_DATE'
    }

    const newInstance = await models.sb_unitprice_change_reservation.create({...body, date: formatYmdHi(body.date)});
    newInstance.save();

    _response.json({
      result: newInstance,
      givenDate: body.date,
      moment: moment().tz("Asia/Seoul").format('YYYY-MM-DD HH:mm:ss'),
      isValid: moment().isAfter(moment(body.date, 'YYYY-MM-DD HH:mm:ss'))
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

  if (_error === 'INVALID_DATE') {
    _response.error.badRequest(_error, '지금 시간 이후부터 예약이 가능합니다.');
    return;
  }
  if (_error === 'DUPLICATED_DATE') {
    _response.error.badRequest(_error, '해당 일시에 등록된 단가 변경 예약이 있습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function formatYmdHi(inputDateString){
  //const inputDateString = "2023-12-27 02:15:00";

  // Use regex to extract components
  const match = inputDateString.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);

  if (match) {
    // Extract components from the regex match
    const [, year, month, day, hour, minute] = match;

    // Create the output string
    const outputString = year + month + day + hour + minute;

    return outputString;
  } else {
    return '';
  }
}
 