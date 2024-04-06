/**
 * Created by Jackie Yoon on 2023-07-17.
 * 토픽 구독 API
 */
'use strict';

import { NextFunction, Request, Response } from 'express';
const { USER_ROLE } = require('../../middleware/role.middleware');
import { getMessaging } from 'firebase-admin/messaging';
import { credential } from 'firebase-admin';
import applicationDefault = credential.applicationDefault;
import axios from 'axios';
import { USER_TYPE } from '../../util/tokenService';

// const models = require('../../models');
const firebase = require('firebase-admin');
const firebaseServiceAccount = require('../../config/hdo-ev-charge-firebase-adminsdk-bbf6m-2e1b232ac4.json');

module.exports = {
  path: ['/subscribe-topic'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  const body = _request.body;
  try {
    const deviceId = body.deviceId;
    const topic = body.topic;

    // firebase app 시작
    await firebase.initializeApp({
      credential: firebase.credential.cert(firebaseServiceAccount),
    });

    // Topic 구독 with REST API
    try {
      const subscribe = await axios({
        url: 'https://iid.googleapis.com/iid/v1/' + deviceId + '/rel/topics/' + topic,
        method: 'POST',
        headers: {
          Authorization: 'key=' + process.env.FCM_API_KEY,
        },
      });
      // Handle the response
      _response.json(subscribe.statusText); // 성공 시 "OK"
    } catch (error: any) {
      _response.error.badRequest('error', error.toString());
    }

    await firebase.app().delete();
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
