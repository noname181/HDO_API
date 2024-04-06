# hdoev-api-total
## DEV environment

---
### 초기설정

#### DB time_zone 변경
1. AWS RDS 콘솔에서 [파라미터 그룹]을 클릭합니다.
2. 파라미터 그룹을 aurora-mysql5.7 패밀리, DB Cluster Parameter Group 유형으로 생성합니다.
3. 생성한 파라미터 그룹에서 time_zone 파라미터를 Asia/Seoul로 변경합니다.
4. DB를 재부팅합니다.

#### 초기 테이블 생성 후 필수 데이터
1. Orgs - 소속 정보들이 기록된 테이블(일반 이용자용 DEF, 현대오일뱅크 관리자용 HDO)
```
1,DEF,일반이용자
2,HDO,현대오일뱅크
```
2. Config - 자주 받아오는 초기 설정값 테이블
```
dviCode,divComment,cfgVal
PARK_ALLOW_MIN,"주차면 점유 허용 시간(분),충전완료 후",15
CHARGE_DEPOSIT,"충전 보증금, 선결제 금액 (원)",40000
PARK_MAX_MIN,미출차 수수료 징수 최대 시간 (분),50
PARK_FEE_PER_MIN,미출차 분당 수수료 (원),100
PARK_DEPOSIT,"미출차 보증금(최대금액),자동 계산(PARK_MAX_MIN)",5000
MEMBER_DISC,모바일 회원 기본 할인 금액 (원),20
DEFAULT_UNITPRICE,"공통기본단가 (원, 충전기 단가 미설정의 경우)",500
MAX_SOC,최대 충전 요청량 kWh (완충 요청시),100

```
3. CodeLookUp - 주로 웹 쪽 select box용 목록 전달 API용 테이블
```
생략
```

---
### 빌드 / 배포

#### 로컬빌드(로컬 테스트)
npm install
npm run build

env 값이 설정된 환경에서 각 IDE로 실행

ex) intelliJ 설정
https://imgur.com/a/Ab6HbDv

ex) vsc 설정

```{
    // launch.json
    // IntelliSense를 사용하여 가능한 특성에 대해 알아보세요.
    // 기존 특성에 대한 설명을 보려면 가리킵니다.
    // 자세한 내용을 보려면 https://go.microsoft.com/fwlink/?linkid=830387을(를) 방문하세요.
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "api 개발모드",
            "skipFiles": [
                생략
            ],
            "program": 생략
            "env": {
                "LOCAL_TEST":"true",
                "NODE_ENV": "dev",
                "API_MODE": "true"
            }
        }
    ]
}
```
해당 환경변수 설명
LOCAL_TEST : 해당 빌드가 로컬에서 실행되는지 여부
NODE_ENV : .env 파일 참조용 분기
API_MODE : api mode가 false일 때 실행시 sequelize model sync가 작동하여 models 폴더에 위치한 모델정의들을 반영함(실제 배포시 작동함). true일 때는 모델 싱크 없이 api 빌드

콘솔에 "DB 동기화 성공."이 뜨면 성공
http://localhost:8080 엔드포인트로 api 접근 가능

#### 운영빌드(운영)

미리 약속된 ci-cd 트리거에 따라(ex. master branch에 커밋을 푸시하면 운영서버에 배포, develop branch에 커밋을 푸시하면 개발서버에 배포) 자동배포
이는 AWS cloudbuild 쪽 설정과 해당 소스의 루트 폴더 내 yaml 파일들을 참조
