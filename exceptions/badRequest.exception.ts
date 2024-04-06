import { HTTP_STATUS_CODE } from '../middleware/newRole.middleware';
import { HttpException } from './http.exception';

export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: string) {
    super(HTTP_STATUS_CODE.BAD_REQUEST, message, errorCode);
  }
}
