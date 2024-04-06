const {USER_ROLE} = require("../../middleware/role.middleware");
const crypto = require("crypto");
module.exports = {
  path: ['/car-info-fail',],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {

  const params = _request?.body;
  console.log('Method:', _request?.method);
  console.log('URL:', _request?.url);
  console.log('Params:', _request?.params);
  console.log('Query:', _request?.query);
  console.log('Headers:', _request?.headers);
  console.log('Body:', _request?.body);

  const fixedMap = {};

  _response.render('carInfo-fail.ejs', { fixedMap });

}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'ERROR EXAMPLE') {
    _response.error.notFound(_error, 'ERROR EXAMPLE.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}