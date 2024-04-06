/**
 * Created by Jackie Yoon on 2023-06-02.
 * Express Response에 Error Response를 담당할 확장모듈
 *
 */
import { Request, Response, NextFunction } from 'express';

interface CustomResponse extends Response {
    error: {
        badRequest: (errorCode: string, message: string, options?: { incorrect?: any[], objects?: any[] }) => void;
        unauthorization: (errorCode: string, message: string) => void;
        notFound: (errorCode: string, message: string, options?: { incorrect?: any[], objects?: any[] }) => void;
        forbidden: (errorCode: string, message: string) => void,
        unknown: (error: Error) => void,
    };
}

const errorHandler = (_request: Request, _response: CustomResponse, next: NextFunction) => {
    _response.error = {
        badRequest: (errorCode, message, options = {}) => {
            const status = 400;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
                incorrect: options.incorrect ? options.incorrect : undefined,
                objects: options.objects ? options.objects : undefined
            }).end();
        },
        unauthorization: (errorCode, message) => {
            const status = 401;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
            }).end();
        },
        forbidden: (errorCode, message) => {
            const status = 403;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
            }).end();
        },
        notFound: (errorCode: string, message: string, options: { incorrect?: any[], objects?: any[] } = {}) => {
            const status = 404;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
                objects: options.objects ? options.objects : undefined,
            }).end();
        },
        unknown: (_error) => {
            const status = 409;
            _response.status(status).json({
                status: status.toString(),
                errorCode: "UNKNOWN_ERROR",
                message: JSON.stringify(_error, null, 2)
            }).end();
        }
    };
    next();
};

export default errorHandler;
