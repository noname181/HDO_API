/**
 * Created by Jackie Yoon on 2023-07-17.
 * 구독한 토픽 조회 API
 */
import { NextFunction, Request, Response } from 'express';
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');

// const models = require('../../models');
const firebase = require('firebase-admin');
const axios = require('axios');
const firebaseServiceAccount = require('../../config/hdo-ev-charge-firebase-adminsdk-bbf6m-2e1b232ac4.json');

module.exports = {
  path: ['/topic'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  try {
    const deviceId = 'SOME_DEVICE_ID';

    // detail 쿼리로 구독한 토픽 조회
    try {
      const topic = await axios({
        url: 'https://iid.googleapis.com/iid/info/' + deviceId + '?details=true',
        method: 'GET',
        headers: {
          Authorization: 'key=' + process.env.FCM_API_KEY,
        },
      });
      // Handle the response
      _response.json(topic.data);
    } catch (error: any) {
      _response.error.badRequest('error', error.toString());
    }
  } catch (e) {
    next(e);
  }
}
function validator(_request: Request, _response: Response, next: NextFunction) {
  next();
}

function errorHandler(_error: any, _request: Request, _response: Response, next: NextFunction) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
