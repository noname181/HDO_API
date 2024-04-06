import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/http.exception';

export const exceptionMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    return err.response(req, res);
  }

  return res.status(500).json({
    errorCode: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    path: req.url,
    message: 'Something went wrong!',
  });
};
