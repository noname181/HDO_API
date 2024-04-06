/**
 * Created by Jackie Yoon on 2023-07-17.
 * 알림 전송 공통 미들웨어
 */
import firebase from "firebase-admin";

// FCM 개인 알림 양식 예제
// {
//     "notification": {
//         "title": "알림 제목입니다.",
//         "body": "알림 내용입니다."
//     },
//     // "data"는 모바일로 정보를 보내기 위한 부분
//     "data": {
//         "link": "",
//         "title": "배송이 시작되었습니다.",
//         "body": "주문하신 상품의 배송이 시작되었습니다.",
//     },
//     // 사용자의 디바이스 토큰
//     "token": "MPf6RMrn6_KXFHeZzTjd5L:APA91bEaFS1et_FdGCIBg81K6AeDU0AxCzML9lYeQm7ya4uo3HYgjMGV_6nGpIIfk7zsZfVYsQ3UqJj1Xcaj6hBpLcz4wlWlDdWTs-jGpw5Z0_HFrSF4HvTYobmxCyOFmBY6QRN_zd81"
// }

// FCM 토픽 전송 양식 예제
// {
//     "notification": {
//     "title": "알림 제목입니다." // 알림 제목
//         "body": "알림 본문입니다." // 알림 본문
//         "imageUrl": "https://test.com/image/logo.png"
// },
//     "data": {
//         "type": "NOTICE_TEST", // 알림 종류,
//         "content": "알림 테스트", // 알림 내용
//         "lang": "ko_KR" // 알림 언어
//      },
//     "topic": "NOTICE_TEST_123_TOPIC" // 전체 공지용 알림 토픽
// }

// FCM 전송부
async function sendFCM(pushVal:any, msg:string, deviceId:string) {
    const admin = require("firebase-admin");
    const firebaseServiceAccount = require('../config/hdo-ev-charge-firebase-adminsdk-bbf6m-2e1b232ac4.json'); // dev private

    // 해당 토픽을 구독하고 있는지 확인
    const isSubscribed = await getSubscribedTopic(deviceId, pushVal.topic);
    if (isSubscribed.status !== '200') return "TOPIC_SUBSCRIPTION_ERROR"

    await firebase.initializeApp({
        credential: firebase.credential.cert(firebaseServiceAccount)
    });

    let message;
    const deliveryType = pushVal.type.toUpperCase(); // 알림 유형이 전체 알림인지 개인 알림인지 확인
    if (deliveryType === "PUBLIC") {
        // !! 주의 !! PUBLIC으로 보낼 시 한번 더 확인할 것
        // 전체 알림용 메시지 객체 생성
        message = {
            "notification": {
                "title": pushVal.title, // 알림 제목
                "body": msg
            },
            "data": {}, // 모바일로 전달할 데이터
            "topic": pushVal.topic // 알림 토픽
        };
    } else if (deliveryType === "PERSONAL") {
        // 개인 알림용 메시지 객체 생성
        message = {
            "notification": {
                "title": pushVal.title, // 알림 제목
                "body": msg
            },
            "data": {}, // 모바일로 전달할 데이터
            "token": deviceId
        };
    } else {
        throw new Error("INVALID_NOTIFICATION_REQUEST");
    }

    // Send the FCM message
    try {
        await admin.messaging().send(message);
        console.log('FCM message sent successfully');
        await firebase.app().delete();
        return "SUCCESS";
    } catch (error) {
        console.error('Error sending FCM message:', error);
        await firebase.app().delete();
        return "ERROR";
    }

}

// 이용자가 토픽을 구독했는지 조회하는 미들웨어
async function getSubscribedTopic (deviceId:string, topic:string) {
    const axios = require('axios');
    try {
        const userSubscribedTopicList = await axios({
            url: "https://iid.googleapis.com/iid/info/" + deviceId + '?details=true',
            method: "GET",
            headers: {
                'Authorization': 'key=' + process.env.FCM_API_KEY
            }
        });
        if (userSubscribedTopicList.data && userSubscribedTopicList.data.rel && userSubscribedTopicList.data.rel.topics[topic]) {
            return {
                "status": '200',
                "message": "입력한 사용자는 해당 토픽을 구독했습니다."
            }
        }
        else {
            return {
                "status": '404',
                "message": "입력한 사용자는 해당 토픽을 구독하지 않았습니다."
            }
        }
    } catch (e:any) {
        console.log(e.toString());
        return {
            "status": '400',
            "message": "알 수 없는 이유로 토픽 구독여부를 조회할 수 없습니다."
        };
    }
}

// 알림톡 공통 사항
// 1. Request Body는 반드시 '['로 시작해 ']'으로 끝나야 합니다.
// 2. 발송 메시지내 개행문자는 '\n'을 사용합니다.
// 3. Header = Content-type: application/json; charset=utf-8
// 4. Method = Post

// 알림톡 Request body parameter
// custMsgSn, varchar(100), 필수, 고객사발송요청 ID (고객사에서 부여한 Unique Key)
// senderKey, varchar(40), 필수, 발신프로필키
// phoneNum, varchar(16), 필수, 수신자 휴대폰번호
// templateCode, varchar(30), 필수, 알림톡 템플릿 코드
// message, nvarchar(1000), 필수, 발송메시지
// smsSndNum, varchar(16), 필수아님, 알림톡 발송실패건 문자전환발송시 발신자 전화번호
// smsKind, varchar(1), 필수아님, 알림톡 발송실패건 문자전환발송시 SMS/LMS 구분 [S: SMS 발송, L: LMS 발송, 그외: 발송안함]
// smsMessage varchar(90), 필수아님, 알림톡 발송실패건 SMS 전환발송시 발송메시지 (smsKind='S'일 때 필수 사용)
// lmsMessage varchar(2000), 필수아님, 알림톡 발송실패건 LMS 전환발송시 발송메시지 (smsKind='L'일 때 사용, 사용하지 않을 경우 message 필드 데이터 전송)
// subject, varchar(40), 필수아님, 알림톡 발송실패건 LMS 전환발송시 LMS 제목
// button, JSON, 필수아님,

// 알림톡 Request Body 예제
// [
//     {
//         "custMsgSn": "customerkey_20190626090000",
//         "senderKey": "senderKey",
//         "phoneNum": "01000000000",
//         "templateCode": "TEST_01",
//         "message": "테스트 알림톡 발송입니다.\n 감사합니다.",
//         "smsSndNum": "020000000",
//         "smsKind": "S",
//         "smsMessage": "우회발송 테스트 문자 데이터입니다."
//     }
// ]

// 알림톡 Response Body 샘플
// sn, varchar(30), 필수, 중계사발송요청ID (엠앤와이즈에서 부여한 Unique Key)
// custMsgSn, varchar(100), 필수, 고객사발송요청ID (고객사에서 부여한 Unique Key)
// sndDtm, varchar(14), 필수아님, 중계사 발송일시 (yyyymmddhh24miss)
// rcptDtm, varchar(14), 필수아님, 중계사 발송결과 수신일시 (yyyymmddhh24miss)
// code, varchar(2), 필수, 'AS': 알림톡/친구톡 발송 성공, 'AF': 알림톡/친구톡 발송 실패, 'SS': 문자 발송 성공, 'SF': 문자 발송 실패
// altCode, varchar(4), 필수아님, 알림톡/친구톡 발송결과코드 0000: success, 3018: NoSendAvailableException 전송X(카톡 미사용, 7일 이내 미사용, 알림톡 차단)
// altMsg, varchar(250), 필수아님, 알림톡/친구톡 발송결과메시지

// 알림톡 Response Body 예제
// [
//     {
//         "sn": "20180531-170322804R102RS270730",
//         "custMsgSn": "customerkey_20170214090000",
//         "code": "AS",
//         "altCode": "0000",
//         "altMsg": "success",
//         "sndDtm": "20170202090001",
//         "rcptDtm": "20170202090001"
//     }
// ]

// 알림톡 전송부
async function sendKakao(msg:any, phoneNo:any, template:string, isSendingSMS: boolean) {
    const axios = require('axios');

    const url = "https://ums-api.mzigi.com:8443/v1/A/hdhyundaioilbank2/mnwise/messages";
    const headers = {"Content-Type": "application/json", "charset": "utf-8"}; // TODO
    const data = {
        custMsgSn: "SOME_UNIQUE_KEY", // TODO 알림톡 전송할 때마다 사용할 고유한 키
        senderKey: process.env.KAKAO_SENDER_PROFILE_KEY,
        phoneNum: phoneNo,
        templateCode: template, // 등록한 템플릿 코드. 230804 현재 템플릿 코드 없음
        message: msg,
        smsSndNum: isSendingSMS ? "025004500" : undefined, // TODO HDO 대표번호로 설정 추후 변동 가능
        smsKind: isSendingSMS ? 'S' : undefined,
        smsMessage: isSendingSMS ? msg : undefined
    };

    try {
        const response = await axios.post(url, data, { headers });
        const sendKakaoResponse = response.data?.response;
        if (sendKakaoResponse?.code === "AS") { // 'AS': success, 알림톡/친구톡 발송 성공
            return "SUCCESS_KAKAO";
        } else if (sendKakaoResponse?.code === "SS") { // 'SS': 성공, 문자 발송 성공
            return "SUCCESS_SMS";
        } else {
            return "FAILED";
        }
    } catch (error) {
        console.error("Error sending Kakao message:", error);
        return "FAILED";
    }
}

// 이메일 전송부
async function sendEmail(toEmailAddr:string, mailTitle:string, mailContent:any) {
    const SES = require('@aws-sdk/client-ses');

    const createSendEmailCommand = (toEmailAddr:string, fromEmailAddr:string, mailTitle:string) => {
        return new SES.SendEmailCommand({
            Destination: {
                CcAddresses: [],
                ToAddresses: [toEmailAddr]
            },
            Message: {
                Body: {
                    Text: {
                        Charset: "UTF-8",
                        Data: mailContent
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: mailTitle
                }
            },
            Source: fromEmailAddr
        });
    }

    const sesClient = new SES.SESClient({ region: "ap-northeast-2" });

    return new Promise((resolve, reject) => {
        // TODO 발신자 이메일 주소 변경하기 dev: hdo-evdev-01@oilbank.co.kr / prod: hdo-evpro-01@oilbank.co.kr
        sesClient.send(createSendEmailCommand(toEmailAddr, 'jackie@caelumglobal.com', mailTitle), (error:any, data:any) => {
            if (error) {
                console.log(error);
                resolve("FAILED");
            }
            else {
                resolve("SUCCESS")
            }
        });
    });
}

module.exports = {
    // 모바일 이용자 알림
    sendNotification: async function (priority: string, // 알림 전송 유형(PNT, 3LVL, 2LVL, PO)
                                      pushVal: any, // FCM 토픽 이름, FCM 알림 제목, 전체/개인 알림여부 ["topic", "title", "PUBLIC/PERSONAL"]
                                      msg: string, // 알림 본문
                                      deviceId: string, // 보낼 이용자의 디바이스 id 내지 토큰
                                      phoneNo: string, // 알림톡 또는 SMS로 보낼 이용자의 핸드폰 번호
                                      templateId: string, // 알림톡 템플릿 코드
                                      // kakaoVal:string // 템플릿 입력 변수 (필요하지 않을 수 있음)
    ) {
        switch (priority) {
            case "PNT": // 앱 push + 알림톡
                const isFCMSendSuccessPNT: any = await sendFCM(pushVal, msg, deviceId);
                const isKakaoSendSuccessPNT: any = await sendKakao(msg, phoneNo, templateId, false);

                return {
                    "push": isFCMSendSuccessPNT === "SUCCESS" ? "SUCCESS" : "FAILED",
                    "kakao": isKakaoSendSuccessPNT === "SUCCESS_KAKAO" ? "SUCCESS" : "FAILED"
                }

            case "3LVL": // 앱 push -> 알림톡 -> SMS
                const isFCMSendSuccess3LVL: any = await sendFCM(pushVal, msg, deviceId);
                const isKakaoSendSuccess3LVL: any = await sendKakao(msg, phoneNo, templateId, true);

                return {
                    "push": isFCMSendSuccess3LVL === "SUCCESS" ? "SUCCESS" : "FAILED",
                    "kakao": isFCMSendSuccess3LVL === "SUCCESS" ? "SKIPPED" : isKakaoSendSuccess3LVL === "SUCCESS_KAKAO" ? "SUCCESS" : "FAILED",
                    "sms":
                        isFCMSendSuccess3LVL === "SUCCESS" ? "SKIPPED" :
                            isFCMSendSuccess3LVL === "FAILED" && isKakaoSendSuccess3LVL === "SUCCESS_SMS" ? "SUCCESS" :
                                isFCMSendSuccess3LVL === "FAILED" && isKakaoSendSuccess3LVL === "SUCCESS" ? "SKIPPED" : "FAILED"
                }

            case "2LVL": // 알림톡 -> SMS
                const isKakaoSendSuccess2LVL: any = await sendKakao(msg, phoneNo, templateId, true);

                return {
                    "kakao": isKakaoSendSuccess2LVL === "SUCCESS_KAKAO" ? "SUCCESS" : "FAILED",
                    "sms": isKakaoSendSuccess2LVL === "SUCCESS_KAKAO" ? "SKIPPED" :
                        isKakaoSendSuccess2LVL === "SUCCESS_SMS" ? "SUCCESS" : "FAILED"
                }
            case "PO": // 앱 push; Push Only
                const isFCMSendSuccessPO: any = await sendFCM(pushVal, msg, deviceId);

                return {
                    "push": isFCMSendSuccessPO === "SUCCESS" ? "SUCCESS" : "FAILED"
                }

            default:
                throw new Error("INVALID_SEND_NOTIFICATION_REQUEST");
        }
    },

    // HDO 및 법인 관리자 알림
    operationErrorSend: async function (priority: string, // 알림 전송 유형(TNE, EO)
                                        toEmailAddr: string, // 수신 이메일
                                        mailTitle: string, // 메일 제목 (에러 제목)
                                        mailContents: string, // 메일 내용, 에러 내용 (조회 화면 링크 포함)
                                        phoneNo: string, // 전화번호
                                        templateId: string, // 템플릿 입력 변수
    ){
        switch (priority) {
            case "TNE": // 알림톡 + 이메일
                const isKakaoSendSuccessTNE:any = await sendKakao(mailContents, phoneNo, templateId, false);
                const isEmailSendSuccessTNE:any = await sendEmail(toEmailAddr, mailTitle, mailContents);

                return {
                    "kakao": isKakaoSendSuccessTNE === "SUCCESS_KAKAO" ? "SUCCESS" : "FAILED",
                    "email": isEmailSendSuccessTNE === "SUCCESS" ? "SUCCESS" : "FAILED"
                }
            case "EO": // Email Only
                const isEmailSendSuccessEO:any = await sendEmail(toEmailAddr, mailTitle, mailContents);

                return {
                    "email": isEmailSendSuccessEO === "SUCCESS" ? "SUCCESS" : "FAILED"
                }
            default:
                throw new Error("INVALID_OPERATION_ERROR_SEND_REQUEST");
        }
    }
}
