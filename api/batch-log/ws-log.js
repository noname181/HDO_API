'use strict';
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const WebSocket = require('ws');
const sequelize = require('sequelize');

const jcoUrl = process.env.JCO_URL || 'ws://hdo-ecr-evdev-evcs-api-jco-service.backend.svc.cluster.local:7778';
const Op = sequelize.Op;

module.exports = {
  path: ['/ws/:type'],
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
    const type = _request.params.type;
    if (!type || !['clearing', 'users', 'sites', 'stations', 'SalesService', 'DepositService'].includes(type)) {
      throw 'REQUEST_INVALID';
    }

    if (['clearing', 'SalesService', 'DepositService'].includes(type)) {
      if (!body.data_day) {
        throw 'DATA_DAY_REQUIRED';
      }
    }

    if (type === 'clearing') {
      if (!body.transaction_id) {
        throw 'TRANSACTION_ID_REQUIRED';
      }
      const transaction = await models.bank_transaction_record.findOne({ where: { id: body.transaction_id } });
      if (!transaction) {
        throw 'TRANSACTION_ID_INVALID';
      }
    }

    let channel = '';
    switch (type) {
      case 'SalesService':
        channel = 'SalesService';
        break;
      case 'DepositService':
        channel = 'DepositService';
        break;
      default:
        channel = `ws/${type}`;
        break;
    }
    const saveResult = async (result) => {
      await models.daily_resend_results.create({
        data_day: body.data_day,
        transaction_id: body.transaction_id,
        result: result,
        time: new Date(),
      });
    };
    console.log(`jcoUrl : ${jcoUrl}/${channel}`);
    let receiveMessage;
    let client = new WebSocket(`${jcoUrl}/${channel}`);

    client.on('error', (e) => {
      if (type === 'clearing') {
        saveResult('E');
      }
      return next('실패');
    });

    client.on('open', () => {
      console.log('Connected to Java WebSocket server');
      if (type === 'clearing') {
        client.send(body.transaction_id);
      } else if (['SalesService', 'DepositService'].includes(type)) {
        client.send(body.data_day);
      } else {
        client.send('');
      }
    });

    client.on('message', (message) => {
      console.log(`Received message from server: ${message}`);
      receiveMessage = message.toString();
      if (type === 'clearing') {
        saveResult('S');
      }
      return _response.json({
        status: '200',
        result: receiveMessage,
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

  if (_error === 'REQUEST_INVALID') {
    _response.error.notFound(_error, 'This request is invalid');
    return;
  }

  if (_error === 'TRANSACTION_ID_REQUIRED') {
    _response.error.notFound(_error, 'transaction_id is missing');
    return;
  }

  if (_error === 'DATA_DAY_REQUIRED') {
    _response.error.notFound(_error, 'data_day is missing');
    return;
  }

  if (_error === 'TRANSACTION_ID_INVALID') {
    _response.error.notFound(_error, 'transaction_id is invalid');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
