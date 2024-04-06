const {USER_ROLE} = require("../../middleware/role.middleware");
module.exports = {
  path: ["/test-ocpp-api"],
  method: "get",
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

const axios = require("axios");
const {configuration} = require("../../config/config");
const OCPP_URL = configuration()?.ocppServerUrl;

async function service(_request, _response, next) {
  try {
    const URL = `${OCPP_URL}testApiForNetwork`;

    const second = 1000;

    return await axios({
      url: URL,
      method: 'GET',
      responseType: "text",
      timeout: 8 * second
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}