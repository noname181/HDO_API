const {USER_ROLE} = require("../../middleware/role.middleware");
const crypto = require("crypto");
module.exports = {
  path: ['/car-info-success',],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {

  // const params = _request?.body;
  // const params = _request?.query;
  // console.log("!!!! success params", params)
  console.log('Method:', _request?.method);
  console.log('URL:', _request?.url);
  console.log('Params:', _request?.params);
  console.log('Query:', _request?.query);
  console.log('Headers:', _request?.headers);
  console.log('Body:', _request?.body);

  // fixedMap.put("returnURLA", "https://car365.go.kr/aio365/provide/returnURLA.do");
  // fixedMap.put("returnURLD", "https://car365.go.kr/aio365/provide/returnURLD.do");

  // const data = { key : 'value'}

  const callbackName = _request.query?.callback;
  if (callbackName) {
    _response.jsonp(data)
  } else {
    _response.json(data)
  }

  const fixedMap = {};
  // _response.render('carInfo-success.ejs', { fixedMap });

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