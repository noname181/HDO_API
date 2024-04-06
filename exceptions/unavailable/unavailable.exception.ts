import { HTTP_STATUS_CODE } from '../../middleware/newRole.middleware';
import { HttpException } from '../http.exception';

export class UnavailableException extends HttpException {
  constructor(message: string, errorCode: string) {
    super(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE, message, errorCode);
  }
}
