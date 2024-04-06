import { HTTP_STATUS_CODE } from '../../middleware/newRole.middleware';
import { HttpException } from '../http.exception';

export class NotFoundException extends HttpException {
  constructor(message: string, errorCode: string) {
    super(HTTP_STATUS_CODE.NOT_FOUND, message, errorCode);
  }
}
