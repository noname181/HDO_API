import { HTTP_STATUS_CODE } from '../../middleware/newRole.middleware';
import { HttpException } from '../http.exception';

export class NotFoundStationException extends HttpException {
  constructor() {
    super(HTTP_STATUS_CODE.NOT_FOUND, '해당 ID에 대한 충전소가 존재하지 않습니다.', 'NOT_EXIST_CHARGING_STATION');
  }
}
