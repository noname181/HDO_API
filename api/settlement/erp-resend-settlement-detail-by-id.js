'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const WebSocket = require('ws');
const sequelize = require('sequelize');

const jcoUrl = process.env.JCO_URL || 'ws://hdo-ecr-evdev-evcs-api-jco-service.backend.svc.cluster.local:7778';
const Op = sequelize.Op;

module.exports = {
  path: '/settlement-detail-erp/resend',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;

  try {
    const saveResult = async (result) => {
      await models.settlement_resend_results.create({
        data_day: body.data_day,
        erp_id: body.erp_id,
        payment_type: body.payment_method,
        result: result,
        time: new Date(),
      });
    };
    let sendMessage = ''.concat([body.data_day, body.erp_id, body.payment_method]); //20231211,12131313,01
    let receiveMessage;
    let client = new WebSocket(`${jcoUrl}/ws/daily_closing`);

    client.on('error', (e) => {
      saveResult('E');
      return next('실패');
    });

    client.on('open', () => {
      console.log('Connected to Java WebSocket server');
      client.send(sendMessage);
    });

    client.on('message', (message) => {
      console.log(`Received message from server: ${message}`);
      receiveMessage = message;
      saveResult('S');
      return _response.json({
        status: '200',
        result: '성공',
      });
    });

    client.on('close', () => {
      console.log('disconnected to Java WebSocket server');
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

  _response.error.unknown(_error.toString());
  next(_error);
}
