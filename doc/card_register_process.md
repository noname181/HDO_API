## 카드 등록 프로세스

1. 앱에서 동의 버튼을 누르면 프론트엔드에서 아래 URL을 웹뷰로 표시

   ```HTTP
   GET /api/v1/paymethod/preregister
   ```

   | 쿼리 파라미터 | 타입     | 설명     |
   | ------------- | -------- | -------- |
   | `shopOrderNo` | `string` | 주문번호 |

   | Header            | Description    |
   | ----------------- | -------------- |
   | `"Authorization"` | 유저 auth 토큰 |

   1. 백엔드에서 PG API로 `POST /api/trades/webpay` 요청을 보냄

      1. `returnUrl`: 카드 등록 요청 처리 결과를 받는 백엔드의 HTTP API path (`POST`)
      2. `shopOrderNo`: 주문번호, 적당히 unique한 테스트 데이터를 입력

   2. PG API 서버가 카드 등록 페이지 URL을 백엔드로 응답

   3. 백엔드가 웹뷰에 리디렉션 리스폰스를 보냄

      | Header       | Description               |
      | ------------ | ------------------------- |
      | `"Location"` | PG사 카드 등록 페이지 URL |

      ```http
      HTTP/1.1 303 See Other
      X-Powered-By: Express
      Location: https://testpgapi.easypay.co.kr/view/trades/cert-req.do?authorizationId=23092210282910561234
      Content-Type: text/plain; charset=utf-8
      Content-Length: 9
      ETag: W/"9-iEoTHZowaH5l5SAoMcHgKcDUOA8"
      Date: Fri, 22 Sep 2023 05:58:05 GMT
      Connection: keep-alive
      Keep-Alive: timeout=5
      
      See Other
      ```

2. 사용자가 카드 정보를 입력함

3. `확인` 버튼을 누르면 웹뷰가 백엔드의 URL로 리디렉션 됨 (1-1에서 백엔드가 PG로 요청할 때 입력한 URL)

   1. 리디렉션으로 발생한 request에는 `authorizationId`, `shopOrderNo`가 포함되어 있고 이것으로 백엔드가 배치키 발급 요청을 PG API에 보냄

   2. 배치키 발급 요청 결과가 담긴 HTML문서를 프론트엔드로 response함

   3. 이벤트 핸들러에서는 아래 JSON 문서를 넘겨줌

      ```json
      {
          "result": "success",
          "message": ""
      }
      ```

      | 필드      | 타입     | 설명                                          |
      | --------- | -------- | --------------------------------------------- |
      | `result`  | `string` | 성공 여부, `"success"` 또는 `"fail"`임        |
      | `message` | `string` | `result`가 `"fail"`일 경우 에러 메시지를 담음 |

4. HTML문서에서 플러터 로드 이벤트 핸들러를 호출함

   ```javascript
     window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
       if (window.flutter_inappwebview.callHandler) {
         window.flutter_inappwebview.callHandler('FlutterHandler', JSON.stringify(androidNice));
       }else{
         window.flutter_inappwebview._callHandler('FlutterHandler', JSON.stringify(androidNice));
       }
     });
   
   ```

5. 플러터 프론트엔드는 호출된 이벤트 핸들러로 결과를 처리함

   ```dart
   // InAppWebView 생성자 파라미터임
   onWebViewCreated: (controller) {
     controller.addJavaScriptHandler(
       handlerName: 'FlutterHandler',
       callback: (arguments) {
         Map<String, dynamic> payload = jsonDecode(arguments[0]);
         if (response['result'] == 'success') { /* 성공 */}
         else { /* 실패 */ }
       });
   },
   ```

```sequence
프론트->백엔드: GET /v1/paymethod/preregister
백엔드->PG API: POST /api/trades/webpay
PG API->백엔드: 카드 등록 페이지 URL response
백엔드->프론트: redirection response
프론트->PG API: GET 카드 등록 페이지
PG API->프론트: response
Note over 프론트: 카드 정보 입력, 확인
프론트->PG API: 카드 정보 송신
PG API->프론트: 결과 response
프론트->백엔드: POST /v1/paymethod/register (redirection)
백엔드->PG API: 카드 생성 승인 요청
PG API->백엔드: 결과 respones (redirection)
Note over 백엔드: 카드 키 값 insert
백엔드->프론트: 결과 페이지 response
Note over 프론트: status 코드로 결과 안내
```


### 체크리스트

* [ ] `shopOrderNo`은 주문번호인데, 카드 등록 프로세스랑 상관 없어 보임
  * [ ] 카드 등록 과정도 주문으로 보고 주문 ID를 생성해야 하는지

