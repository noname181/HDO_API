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
const { USER_STATUS } = require('../../controllers/mobileControllers/auth/loginByAccountId/loginByAccountId');
const platform = os.platform();

//모듈의 절대 경로(권한:755 , FTP업로드방식 : binary)
let sModulePath;

if (platform === 'win32') {
  console.log('운영 체제: Windows');
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

module.exports = {
  path: ['/checkplus_success/:type/:userType'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  var sRtnMSG = '';
  var requestnumber = '';
  var authtype = '';
  var errcode = '';

  try {
    const type = _request.params.type;
    const userType = _request.params.userType;
    var sEncData = _request.body.EncodeData || _request.query.EncodeData || '';
    var cmd = '';

    const responseUrl =
      _request.headers.host === 'localhost:8080' ? 'http://localhost:3000' : 'https://evnu.oilbank.co.kr/';

    if (/^0-9a-zA-Z+\/=/.test(sEncData) == true) {
      sRtnMSG = '입력값 오류';
      requestnumber = '';
      authtype = '';
      errcode = '';
      _response.render('checkplus_fail.ejs', { sRtnMSG, requestnumber, authtype, errcode });
      return;
    }

    if (sEncData != '') {
      cmd =
        sModulePath + ' ' + 'DEC' + ' ' + process.env.PASS_SITE_CODE + ' ' + process.env.PASS_SITE_PW + ' ' + sEncData;
      console.log('cmd-', cmd);
    }

    var sDecData = '';

    var child = exec(cmd, { encoding: 'euc-kr' });
    child.stdout.on('data', function (data) {
      sDecData += data;
    });
    child.on('close', async function () {
      //console.log(sDecData);

      //처리 결과 메시지
      var sRtnMSG = '';
      //처리 결과 확인
      if (sDecData == '-1') {
        sRtnMSG = '암/복호화 시스템 오류';
      } else if (sDecData == '-4') {
        sRtnMSG = '복호화 처리 오류';
      } else if (sDecData == '-5') {
        sRtnMSG = 'HASH값 불일치 - 복호화 데이터는 리턴됨';
      } else if (sDecData == '-6') {
        sRtnMSG = '복호화 데이터 오류';
      } else if (sDecData == '-9') {
        sRtnMSG = '입력값 오류';
      } else if (sDecData == '-12') {
        sRtnMSG = '사이트 비밀번호 오류';
      } else {
        //항목의 설명은 개발 가이드를 참조
        var requestnumber = decodeURIComponent(GetValue(sDecData, 'REQ_SEQ')); //CP요청 번호 , main에서 생성한 값을 되돌려준다. 세션등에서 비교 가능
        var responsenumber = decodeURIComponent(GetValue(sDecData, 'RES_SEQ')); //고유 번호 , 나이스에서 생성한 값을 되돌려준다.
        var authtype = decodeURIComponent(GetValue(sDecData, 'AUTH_TYPE')); //인증수단
        var name = decodeURIComponent(GetValue(sDecData, 'UTF8_NAME')); //이름
        var birthdate = decodeURIComponent(GetValue(sDecData, 'BIRTHDATE')); //생년월일(YYYYMMDD)
        var gender = decodeURIComponent(GetValue(sDecData, 'GENDER')); //성별
        var nationalinfo = decodeURIComponent(GetValue(sDecData, 'NATIONALINFO')); //내.외국인정보
        var dupinfo = decodeURIComponent(GetValue(sDecData, 'DI')); //중복가입값(64byte)
        var conninfo = decodeURIComponent(GetValue(sDecData, 'CI')); //연계정보 확인값(88byte)
        var mobileno = decodeURIComponent(GetValue(sDecData, 'MOBILE_NO')); //휴대폰번호(계약된 경우)
        var mobileco = decodeURIComponent(GetValue(sDecData, 'MOBILE_CO')); //통신사(계약된 경우)
      }
      console.log(sDecData);

      // 해당 dupinfo로 가입된 계정이 있다면 알려준다.
      let accountId = null;
      let message = null;
      let status = 'ACTIVE';
      // const user = await models.UsersNew.findOne({
      //   where: { phoneNo: mobileno },
      //   paranoid: false,
      // });

      const user = await models.UsersNew.findOne({
        where: {
          type: userType || 'MOBILE',
          phoneNo: {
            [Op.in]: [mobileno, showPhoneNo(mobileno)],
          },
        },
      });

      if (user?.dataValues?.status === 'BLOCK') {
        status = 'BLOCK';
        message = '로그인 오류!(블락된 사용자).';
      } else if (type === 'register' && user?.dataValues?.status === 'ACTIVE') {
        message = '이미 가입된 전화번호입니다.';
      } else if (type === 'find_pw' || type === 'verify') {
        if (!user?.dataValues?.accountId) {
          message = '가입된 유저의 휴대폰번호가 아닙니다.';
        } else {
          accountId = user?.dataValues?.accountId;
        }
      }

      // 본인인증을 시도한 그 웹창은, 이 응답결과를 기다림. 디버그켜놓고 멈춰놓으면 계속 응답대기임.
      // 플러터쪽에 뭔가 넘겨줄 필요가 있다면. 여기서 뭔가 잘 처리해야 할듯.
      {
        //항목의 설명은 개발 가이드를 참조
        var requestnumber = decodeURIComponent(GetValue(sDecData, 'REQ_SEQ')); //CP요청 번호 , main에서 생성한 값을 되돌려준다. 세션등에서 비교 가능
        var responsenumber = decodeURIComponent(GetValue(sDecData, 'RES_SEQ')); //고유 번호 , 나이스에서 생성한 값을 되돌려준다.
        var authtype = decodeURIComponent(GetValue(sDecData, 'AUTH_TYPE')); //인증수단
        var name = decodeURIComponent(GetValue(sDecData, 'UTF8_NAME')); //이름
        var birthdate = decodeURIComponent(GetValue(sDecData, 'BIRTHDATE')); //생년월일(YYYYMMDD)
        var gender = decodeURIComponent(GetValue(sDecData, 'GENDER')); //성별
        var nationalinfo = decodeURIComponent(GetValue(sDecData, 'NATIONALINFO')); //내.외국인정보
        var dupinfo = decodeURIComponent(GetValue(sDecData, 'DI')); //중복가입값(64byte)
        var conninfo = decodeURIComponent(GetValue(sDecData, 'CI')); //연계정보 확인값(88byte)
        var mobileno = decodeURIComponent(GetValue(sDecData, 'MOBILE_NO')); //휴대폰번호(계약된 경우)
        var mobileco = decodeURIComponent(GetValue(sDecData, 'MOBILE_CO')); //통신사(계약된 경우)
      }

      var response = {
        sRtnMSG,
        requestnumber,
        responsenumber,
        authtype,
        name,
        birthdate,
        gender,
        nationalinfo,
        dupinfo,
        conninfo,
        mobileno,
        mobileco,
        accountId, // If User Exists accountId is not null
        message,
        status,
      };

      var renderPage = type === 'verify' ? 'verify-success.ejs' : 'checkplus-success.ejs';

      if (userType === 'CS') {
        console.log('플렛폼 확인 안됨?', platform);
        console.log('확인확인확인');
        _response.send(`
      <script>
        try {
          window.opener.postMessage(${JSON.stringify(response)}, '${responseUrl}');
          window.close(); // 팝업 창 닫기
        } catch (e) {
          console.error('Error posting message:', e);
        }
      </script>
`);
      } else {
        console.log('플렛폼 확인 안됨?', platform);
        console.log('확인해보자 CSCSCS222222');
        _response.render(renderPage, response);
      }

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

function GetValue(plaindata, key) {
  var arrData = plaindata.split(':');
  var value = '';
  for (let i in arrData) {
    var item = arrData[i];
    if (item.indexOf(key) == 0) {
      var valLen = parseInt(item.replace(key, ''));
      arrData[i++];
      value = arrData[i].substr(0, valLen);
      break;
    }
  }
  return value;
}

function showPhoneNo(phoneNo) {
  if (!phoneNo) {
    return '';
  }

  return phoneNo.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}
