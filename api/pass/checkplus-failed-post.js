/**
 * Created by Sarc bae on 2023-08-02.
 * PASS인증 시작 API
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const bodyParser = require("body-parser"); // body-parser 모듈 추가
const exec = require("child_process").exec; // child_process 모듈 추가
const os = require("os");
const platform = os.platform();

//모듈의 절대 경로(권한:755 , FTP업로드방식 : binary)
let sModulePath;

if (platform === "win32") {
  console.log("운영 체제: Windows");
  sModulePath = "modules\\checkplus\\Windows\\CPClient_x64.exe";
} else if (platform === "darwin") {
  console.log("운영 체제: macOS");
  sModulePath = "modules/checkplus/mac/CPClient_mac";
} else if (platform === "linux") {
  console.log("운영 체제: Linux");
  sModulePath = "modules/checkplus/Linux/CPClient_linux_x64";
} else {
  console.log("알 수 없는 운영 체제");
}
module.exports = {
  path: ["/checkplus_fail", "/verify_fail"],
  method: "post",
  checkToken: false, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  var sRtnMSG = "";
  var requestnumber = "";
  var authtype = "";
  var errcode = "";

  try {
    var sEncData = request.param("EncodeData");
    var cmd = "";

    if (/^0-9a-zA-Z+\/=/.test(sEncData) == true) {
      sRtnMSG = "입력값 오류";
      requestnumber = "";
      authtype = "";
      errcode = "";
      response.render("checkplus_fail.ejs", { sRtnMSG, requestnumber, authtype, errcode });
      return
    }

    if (sEncData != "") {
      cmd = sModulePath + " " + "DEC" + " " + sSiteCode + " " + sSitePW + " " + sEncData;
    }

    var sDecData = "";

    var child = exec(cmd, { encoding: "euc-kr" });
    child.stdout.on("data", function (data) {
      sDecData += data;
    });
    child.on("close", function () {
      //console.log(sDecData);

      //처리 결과 메시지
      var sRtnMSG = "";
      //처리 결과 확인
      if (sDecData == "-1") {
        sRtnMSG = "암/복호화 시스템 오류";
      } else if (sDecData == "-4") {
        sRtnMSG = "복호화 처리 오류";
      } else if (sDecData == "-5") {
        sRtnMSG = "HASH값 불일치 - 복호화 데이터는 리턴됨";
      } else if (sDecData == "-6") {
        sRtnMSG = "복호화 데이터 오류";
      } else if (sDecData == "-9") {
        sRtnMSG = "입력값 오류";
      } else if (sDecData == "-12") {
        sRtnMSG = "사이트 비밀번호 오류";
      } else {
        //항목의 설명은 개발 가이드를 참조
        var requestnumber = decodeURIComponent(GetValue(sDecData, "REQ_SEQ")); //CP요청 번호 , main에서 생성한 값을 되돌려준다. 세션등에서 비교 가능
        var authtype = decodeURIComponent(GetValue(sDecData, "AUTH_TYPE")); //인증수단
        var errcode = decodeURIComponent(GetValue(sDecData, "ERR_CODE")); //본인인증 실패 코드
      }


       // Get the URL path
       const urlPath = _request.path;

       // Check if the user is calling /checkplus_fail or /verify_fail
       if (urlPath.includes("/checkplus_fail")) {
           _response.render("checkplus-fail.ejs", { sRtnMSG, requestnumber, authtype, errcode });
       } else {
           _response.render("verify-fail.ejs", { sRtnMSG, requestnumber, authtype, errcode });
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

  if (_error === "RETRIEVE_CONFIG_FAILED") {
    _response.error.notFound(_error, "설정(CONFIG)값 조회에 실패하였습니다.");
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function GetValue(plaindata, key) {
  var arrData = plaindata.split(":");
  var value = "";
  for (let i in arrData) {
    var item = arrData[i];
    if (item.indexOf(key) == 0) {
      var valLen = parseInt(item.replace(key, ""));
      arrData[i++];
      value = arrData[i].substr(0, valLen);
      break;
    }
  }
  return value;
}
