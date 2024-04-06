/**
 * Created by Sarc bae on 2023-08-02.
 * PASS인증 시작 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bodyParser = require('body-parser'); // body-parser 모듈 추가
const exec = require('child_process').exec; // child_process 모듈 추가
const os = require('os');
const platform = os.platform();

var sAuthType = ''; //없으면 기본 선택화면, M(휴대폰), X(인증서공통), U(공동인증서), F(금융인증서), S(PASS인증서), C(신용카드)
var sCustomize = ''; //없으면 기본 웹페이지 / Mobile : 모바일페이지

var requestUrl = 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb';

// 본인인증 처리 후, 결과 데이타를 리턴 받기위해 다음예제와 같이 http부터 입력합니다.
// 리턴url은 인증 전 인증페이지를 호출하기 전 url과 동일해야 합니다. ex) 인증 전 url : https://www.~ 리턴 url : https://www.~

module.exports = {
  path: ['/request-auth/:type', '/request-auth/:type/:userType'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const params = _request.params;
  var userType = params.userType || 'MOBILE';
  console.log('유저 타입 확인', userType);
  var sReturnUrl = '/checkplus_success/' + params.type + '/' + userType;
  // 성공시 이동될 URL (방식 : 프로토콜을 포함한 절대 주소)
  var sErrorUrl = params.type === 'verify' ? '/verify_fail' : '/checkplus_fail'; // 실패시 이동될 URL (방식 : 프로토콜을 포함한 절대 주소)
  const responseUrl =
    _request.headers.host === 'localhost:8080' ? 'http://localhost:8080' : 'https://' + _request.headers.host;
  let sModulePath;

  if (platform === 'win32') {
    console.log('운영 체제: Windows');
    // sModulePath = 'C:\\Users\\A\\Desktop\\CheckPlusSafe_JS_1\\샘플-run\\checkplus\\Windows\\CPClient_x64.exe';
    sModulePath = 'modules\\checkplus\\Windows\\CPClient_x64.exe';
  } else if (platform === 'darwin') {
    console.log('운영 체제: macOS');
    sModulePath = 'modules/checkplus/mac/CPClient_mac';
  } else if (platform === 'linux') {
    console.log('운영 체제: Linux');
    sModulePath = 'modules/checkplus/Linux/CPClient_linux_x64';
  } else {
    console.log('알 수 없는 운영 체제');
  }

  //모듈의 절대 경로(권한:755 , FTP업로드방식 : binary)
  // ex) sModulePath = 'C:\\module\\CPClient.exe';
  //     sModulePath = '/root/modile/CPClient';
  // var sModulePath = '/checkplus/Windows/CPClient_x64.exe';

  try {
    //업체 요청 번호
    //세션등에 저장하여 데이터 위변조 검사 (인증후에 다시 전달)
    var d = new Date();
    var sCPRequest = process.env.PASS_SITE_CODE + '_' + d.getTime();

    //전달 원문 데이터 초기화
    var sPlaincData = '';
    //전달 암호화 데이터 초기화
    var sEncData = '';
    //처리 결과 메시지
    var sRtnMSG = '';

    sPlaincData =
      '7:REQ_SEQ' +
      sCPRequest.length +
      ':' +
      sCPRequest +
      '8:SITECODE' +
      process.env.PASS_SITE_CODE.length +
      ':' +
      process.env.PASS_SITE_CODE +
      '9:AUTH_TYPE' +
      sAuthType.length +
      ':' +
      sAuthType +
      '7:RTN_URL' +
      (responseUrl + sReturnUrl).length +
      ':' +
      responseUrl +
      sReturnUrl +
      '7:ERR_URL' +
      (responseUrl + sErrorUrl).length +
      ':' +
      responseUrl +
      sErrorUrl +
      '9:CUSTOMIZE' +
      sCustomize.length +
      ':' +
      sCustomize;
    console.log('[' + sPlaincData + ']');

    var cmd =
      sModulePath + ' ' + 'ENC' + ' ' + process.env.PASS_SITE_CODE + ' ' + process.env.PASS_SITE_PW + ' ' + sPlaincData;

    var child = exec(cmd, { encoding: 'euc-kr' });
    child.stdout.on('data', function (data) {
      sEncData += data;
    });
    child.on('close', function () {
      //console.log(sEncData);
      //이곳에서 result처리 해야함.

      //처리 결과 확인
      if (sEncData == '-1') {
        sRtnMSG = '암/복호화 시스템 오류입니다.';
      } else if (sEncData == '-2') {
        sRtnMSG = '암호화 처리 오류입니다.';
      } else if (sEncData == '-3') {
        sRtnMSG = '암호화 데이터 오류 입니다.';
      } else if (sEncData == '-9') {
        sRtnMSG = '입력값 오류 : 암호화 처리시, 필요한 파라미터 값을 확인해 주시기 바랍니다.';
      } else {
        sRtnMSG = '';
        _response.redirect(requestUrl + `?m=checkplusService&EncodeData=` + sEncData);
        return;
      }
      // console.log({sEncData: sEncData, sRtnMSG: sRtnMSG});

      _response.json({
        status: '200',
        result: requestUrl + `?m=checkplusService&EncodeData=` + sEncData,
      });
      return;
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

  if (_error === 'RETRIEVE_CONFIG_FAILED') {
    _response.error.notFound(_error, '설정(CONFIG)값 조회에 실패하였습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
