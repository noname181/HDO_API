import { NextFunction, Request, Response } from "express";
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

async function service(request: Request, response: Response, next: NextFunction) {
  const { user: userAuth } = request;

  const user = await models.UsersNew.findOne({
    where: { id: userAuth.id },
  });

  if (!user) {
    return next("USER_IS_NOT_FOUND");
  }

  await models.UsersNew.update(
    { 
      lastOnline: new Date(),
      refreshToken: null 
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return response.status(204).json();
}

function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === "USER_IS_NOT_FOUND") {
    return response.error.notFound(error, "해당 회원의 데이터가 존재하지 않습니다.");
  }

  next();
}
