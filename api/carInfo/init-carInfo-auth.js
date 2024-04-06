'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bodyParser = require('body-parser'); // body-parser 모듈 추가
const exec = require('child_process').exec; // child_process 모듈 추가
const crypto = require('crypto');

module.exports = {
  path: ['/request-car-info',],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

/*
개발 : http://14.35.194.170:8080/aio365/provide/ProvideContent.do
운영 : http://car365.go.kr/aio365/provide/ProvideContent.do

제공기관코드 암호화 값	            hashValue	String	Y	기관코드를 hash 암호화한 값
현재시간	                        timeStamp	String	Y	현재시간을 yyyyMMddHHmmss 형식으로 적용한 값
서비스코드 배열	                  svcCodeArr	String	Y	서비스코드1,서비스코드2
SITE_URL 회원사 요청 사이트 URL	  siteURL	String	Y	신규 추가
회원사 요청 사이트명 (최대 50bytes)	siteName	String	Y	신규 추가
서비스 타입	s                     vcType	String	N	Y / N (차량 소유자 및 차량 등록번호 고정 여부 입력되지 않았을 경우 N 으로 판단)
성공 리턴 URL 	                  retrunURLA	String	N	성공에 대한 리턴 URL
실패 리턴 URL	                  retrunURLD	String	N	실패에 대한 리턴 URL
차량 소유자 이름	                  carOwner	String	N	차량 소유자 이름
차량 등록번호	                    carRegNo	String	N	차량 등록번호

 */

async function service(_request, _response, next) {

  const params = _request.query;

  // 기초정보
  const presentDate = new Date();
  const timeStamp = presentDate.toISOString().replace(/[-T:]/g, '').slice(0, -5);
  const insttCode = "0022A20F3D94F9AF684FB5685A5508B2"; // 제공기관코드
  // 암호화 키
  const encryptKey = params?.encryptKey?.toString() || "ts2020";
  const preHashValue = insttCode + timeStamp + encryptKey;

  const hashValue = crypto
    .createHash('sha256')
    .update(preHashValue, 'utf-8')
    .digest('hex');


  /////////////////////////////
  // 사용자 이름 및 자동차 번호 고정 방식
  /////////////////////////////
  const fixedMap = {};

  fixedMap['hashValue'] = hashValue;
  fixedMap['timeStamp'] = timeStamp;

  // 공간에 등록 신청한 엑셀 양식을 통해 제공받는 서비스 코드
  fixedMap['svcCodeArr'] = "0022A20F3D9EE75B8D21754D8B0C7653";

  fixedMap['returnURLA'] = params?.returnURLA || "https://api-evnu.oilbank.co.kr/car-info-success";
  fixedMap['returnURLD'] = params?.returnURLD || "https://api-evnu.oilbank.co.kr/car-info-fail";

  // 고정방식 Y / 비고정방식 N
  fixedMap['svcType'] = "N";

  const carOwner = params?.carOwner
  const carRegNo = params?.carRegNo

  if (carOwner && carRegNo) {
    fixedMap['carOwner'] = carOwner;
    fixedMap['carRegNo'] = carRegNo;
    fixedMap['svcType'] = "Y";
  }

  fixedMap['siteURL'] = params?.siteURL || "https://www.oilbank.co.kr";
  fixedMap['siteName'] = params?.siteName || "현대오일뱅크";

  _response.render('init-carInfo-auth.ejs', { fixedMap });

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