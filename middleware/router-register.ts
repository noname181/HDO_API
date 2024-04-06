/**
 * Created by Sarc Bae on 2021-06-23.
 * Modified by Jackie Yoon on 2023-06-14.
 * Root API Router Finder
 * 이 미들웨어 설정시 정의한 Path에 담겨있는 API파일들을 따로 등록 하지 않아도 자동으로 등록하게 하는 미들웨어
 */

import { configuration } from '../config/config';
import { TokenService } from '../util/tokenService';
import { NewRoleMiddleware } from './newRole.middleware';
import { NextFunction, Request, Response } from 'express';
import { userActionLogMiddleware } from './user-action-logger';
const { AuthMiddleware } = require('./auth.middleware');

const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const rootPath = path.dirname(require.main?.filename || process.mainModule?.filename || '');

module.exports = (startPath: string, routerFileFilter: string) => {
  console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}]` + ' API Router Module Load...', '\n');
  fromDir(startPath, routerFileFilter);
  console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}]` + ' API Router Module Loaded', '\n');
  return router;
};

const blacklist = ['paymethod'];

function fromDir(apiPath: any, filter: any) {
  if (!fs.existsSync(apiPath)) {
    return;
  }

  const files = fs.readdirSync(apiPath);

  files
    .map((file: string) => path.join(apiPath, file))
    .forEach((filename: string) => {
      const stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        /**
         * TODO bad solution for worse code
         * Automatic router registration based on filename breaks a lot of things IMO
         * We need better way to register router.
         */
        if (blacklist.includes(path.basename(filename))) console.log('skipping directory ', filename);
        else fromDir(filename, filter);
      } else if (filename.indexOf(filter) >= 0) {
        if (filename.includes('index.js')) {
          return null;
        }
        const apiDirPath = rootPath + '/' + filename;
        console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + filename);
        const api = require(apiDirPath);
        try {
          routerRegister(api);
        } catch (e) {
          console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ${e}`, '\n');
        }
      }
    });
}

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const newRoleMiddleware = new NewRoleMiddleware();

function routerRegister(api: any) {
  // console.log("api path 점검",api.path == '/terms')
  switch (api.method.toUpperCase()) {
    case 'GET':
      router.get(
        api.path,
        api.checkToken === true
          ? authMiddleware.checkToken(api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        api.checkToken === true
          ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        userActionLogMiddleware(api.logDisable),
        api.validator,
        api.service,
        api.errorHandler
      );
      // router.get(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
      break;
    case 'POST':
      if (api.multer) {
        router.post(
          api.path,
          api.checkToken === true
            ? authMiddleware.checkToken(api.checkToken)
            : async (request: Request, response: Response, next: NextFunction) => {
                return next();
              },
          api.checkToken === true
            ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
            : async (request: Request, response: Response, next: NextFunction) => {
                return next();
              },
          userActionLogMiddleware(api.logDisable),
          api.multer,
          api.validator,
          api.service,
          api.errorHandler
        );
        // router.post(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.multer, api.validator, api.service, api.errorHandler);
        break;
      }
      router.post(
        api.path,
        api.checkToken === true
          ? authMiddleware.checkToken(api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        api.checkToken === true
          ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        userActionLogMiddleware(api.logDisable),
        api.validator,
        api.service,
        api.errorHandler
      );
      // router.post(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
      break;
    case 'PUT':
      if (api.multer) {
        router.put(
          api.path,
          api.checkToken === true
            ? authMiddleware.checkToken(api.checkToken)
            : async (request: Request, response: Response, next: NextFunction) => {
                return next();
              },
          api.checkToken === true
            ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
            : async (request: Request, response: Response, next: NextFunction) => {
                return next();
              },
          userActionLogMiddleware(api.logDisable),
          api.multer,
          api.validator,
          api.service,
          api.errorHandler
        );
        // router.put(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.multer, api.validator, api.service, api.errorHandler);
      }
      router.put(
        api.path,
        api.checkToken === true
          ? authMiddleware.checkToken(api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        api.checkToken === true
          ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        userActionLogMiddleware(api.logDisable),
        api.validator,
        api.service,
        api.errorHandler
      );
      // router.put(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
      break;
    case 'DELETE':
      router.delete(
        api.path,
        api.checkToken === true
          ? authMiddleware.checkToken(api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        api.checkToken === true
          ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        userActionLogMiddleware(api.logDisable),
        api.validator,
        api.service,
        api.errorHandler
      );
      // router.delete(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
      break;
    case 'PATCH':
      router.patch(
        api.path,
        api.checkToken === true
          ? authMiddleware.checkToken(api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        api.checkToken === true
          ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
          : async (request: Request, response: Response, next: NextFunction) => {
              return next();
            },
        userActionLogMiddleware(api.logDisable),
        api.validator,
        api.service,
        api.errorHandler
      );
      // router.patch(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
      break;
  }
}
