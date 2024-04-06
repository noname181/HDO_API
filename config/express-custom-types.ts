/**
 * Created by Jackie Yoon on 2023-06-14.
 * Express custom type 추가 설정
 *
 */

import { PERMISSIONS } from '../middleware/newRole.middleware';
import { IAuthUser } from '../util/tokenService';

declare global {
  namespace Express {
    interface Response {
      error: {
        badRequest: (errorCode: string, message: string, options?: { incorrect?: any[]; objects?: any[] }) => void;
        unauthorization: (errorCode: string, message: string) => void;
        notFound: (errorCode: string, message: string, options?: { incorrect?: any[]; objects?: any[] }) => void;
        forbidden: (errorCode: string, message: string) => void;
        unknown: (error: Error) => void;
      };
    }
    interface Request {
      user: IAuthUser;
      privateView?: boolean;
    }
  }
}
export {}; // Export an empty object to ensure proper module behavior
