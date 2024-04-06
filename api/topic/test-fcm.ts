/**
 * Created by Jackie Yoon on 2023-07-17.
 * FCM 테스트 API
 */

import { NextFunction, Request, Response } from 'express';
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');
const notification = require('../../middleware/send-notification');

module.exports = {
  path: ['/test-fcm'],
  method: 'post',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  const body = _request.body;
  try {
    const deviceId = body.deviceId;
    const testNotification = await notification.sendNotification(
      'PO',
      {
        topic: 'noti-test-123',
        title: '알림 테스트입니다.',
        type: 'PERSONAL',
      },
      '알림 기능 개발을 위한 테스트입니다.',
      deviceId,
      '01012345678',
      'TEMPLATE'
    );

    _response.json(testNotification);
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
