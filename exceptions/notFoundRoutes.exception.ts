import { HTTP_STATUS_CODE } from '../middleware/newRole.middleware';
import { HttpException } from './http.exception';

export class NotFoundRoutesException extends HttpException {
  constructor() {
    super(HTTP_STATUS_CODE.NOT_FOUND, 'Router is not found', 'ROUTER_NOT_FOUND');
  }
}
