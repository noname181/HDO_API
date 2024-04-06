import { Handler, NextFunction, Request, Response } from 'express';

export const exceptionAsyncService = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
