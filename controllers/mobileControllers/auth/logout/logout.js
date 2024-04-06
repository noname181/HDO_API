"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../../../../models");
const { USER_ROLE } = require("../../../../middleware/role.middleware");
module.exports = {
    path: "/mobile/auth/logout",
    method: "post",
    checkToken: true,
    roles: [USER_ROLE.ALL],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user: userAuth } = request;
        const user = yield models.UsersNew.findOne({
            where: { id: userAuth.id },
        });
        if (!user) {
            return next("USER_IS_NOT_FOUND");
        }
        yield models.UsersNew.update({
            lastOnline: new Date(),
            refreshToken: null
        }, {
            where: {
                id: user.id,
            },
        });
        return response.status(204).json();
    });
}
function validator(request, response, next) {
    next();
}
function errorHandler(error, request, response, next) {
    if (error === "USER_IS_NOT_FOUND") {
        return response.error.notFound(error, "해당 회원의 데이터가 존재하지 않습니다.");
    }
    next();
}
