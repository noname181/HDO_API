import { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '../middleware/newRole.middleware';

export type ExceptionResponse = {
  errorCode: string;
  timestamp: string;
  path: string;
  message: string;
};

export class HttpException extends Error {
  private status: HTTP_STATUS_CODE;
  message: string;
  private errorCode: string;

  constructor(status: HTTP_STATUS_CODE, message: string, errorCode: string) {
    super(message);
    this.message = message;
    this.status = status;
    this.errorCode = errorCode;
  }

  response(req: Request, res: Response) {
    return res.status(this.status).json({
      errorCode: this.errorCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: this.message,
    });
  }
}
