import { TokenExpiredError, sign, verify } from 'jsonwebtoken';
import { IConfig } from '../config/config';

export enum USER_TYPE {
  HDO = 'hdo',
  EXTERNAL = 'org',
  MOBILE = 'mobile',
}

export interface IAuthUser {
  id: string;
  accountId: string;
  type: USER_TYPE;
  roleId?: string;
}

export class TokenService {
  constructor(private config: IConfig) {}

  async accessTokenGenerator(payload: IAuthUser): Promise<string> {
    const key = this.config.jwtAccessTokenKey;
    const expiredTime = this.config.jwtAccessTokenExpireTime;
    return await this.tokenGenerator(payload, key, expiredTime);
  }

  async refreshTokenGenerator(payload: IAuthUser) {
    const key = this.config.jwtRefreshTokenKey;
    const expiredTime = this.config.jwtRefreshTokenExpireTime;
    return await this.tokenGenerator(payload, key, expiredTime);
  }

  tokenGenerator(payload: IAuthUser, key: string, expiredTime: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const token = sign(payload, key, { expiresIn: expiredTime });
      if (!token) {
        reject(new Error('Error while create token'));
      }
      resolve(token);
    });
  }

  verifyToken(token: string, key: string): Promise<IAuthUser> {
    return new Promise((resolve, reject) => {
      try {
        const payload = verify(token, key);
        const isDecodeValid = this.checkDecodeObject(payload);
        if (isDecodeValid) {
          resolve({
            id: payload.id,
            accountId: payload.accountId,
            type: payload.type,
            roleId: payload.roleId || undefined,
          });
        }
        reject(new Error('TOKEN_IS_INVALID'));
      } catch (error) {
        if (error instanceof Error && error.message === 'invalid signature') {
          reject(new Error('SIGNATURE_INVALID'));
        }

        if (error instanceof Error && error.message === 'jwt expired') {
          reject(new Error('TOKEN_IS_EXPIRED'));
        }

        reject(new Error('TOKEN_IS_INVALID'));
      }
    });
  }

  checkDecodeObject(object: any): object is IAuthUser {
    return 'id' in object && 'accountId' in object;
  }
}
