# 정책 및 약관 버전관리 기능

## 용어 정의

* 백엔드: `hdoev-api-total` 서버
* 프론드엔드: `hdoev-web-admin` 서버 및 웹 페이지

## Note

아래 필드들은 테이블의 일관성을 위해 추가하는 것으로 결정되었음

* `createdAt`
* `updatedAt`
* `deletedAt`
* `createdWho`
* `updatedWho`

이 중 `createdAt`은 버전 관리 측면에서 활용 가능할 것 같음 (생성/수정 일자)

## 정책 및 약관 DB 테이블 정의

### Terms

정책 및 약관 페이지에서 표시되는 하나의 레코드를 나타냄

| Column       | Type                 | Description               |
| ------------ | -------------------- | ------------------------- |
| `id`         | `INT  UNSIGNED`      | 기본키                    |
| `latest`     | `SMALLINT UNSIGNED`  | 정책 및 약관의 최신 버전  |
| `createdAt`  | `TIMESTAMP`          | 생성된 시간               |
| `updatedAt`  | `TIMESTAMP`          | 갱신된 시간               |
| `deletedAt`  | `TIMESTAMP` | `NULL` | 삭제된 시간               |
| `createdWho` | `VARCHAR(36)`        | 레코드를 생성한 웹 사용자 |
| `updatedWho` | `VARCHAR(36)`        | 레코드를 갱신한 웹 사용자 |

### TermData

정책 및 약관의 하나의 버전을 나타냄

| Column       | Type                 | Description               |
| ------------ | -------------------- | ------------------------- |
| `id`         | `INT UNSIGNED`       | 외부키                    |
| `version`    | `SMALLINT UNSIGNED`  | 버전                      |
| `title`      | `VARCHAR(255)`     | 제목                      |
| `contents`   | `TEXT`               | 내용                      |
| `createdAt`  | `TIMESTAMP`          | 생성된 시간               |
| `updatedAt`  | `TIMESTAMP`          | 갱신된 시간               |
| `deletedAt`  | `TIMESTAMP` | `NULL` |
| `createdWho` | `VARCHAR(36)`        | 레코드를 생성한 웹 사용자 |
| `updatedWho` | `VARCHAR(36)`        | 레코드를 갱신한 웹 사용자 |

* `id`는 `Terms`의 레코드를 가리키는 외부키임
* `version`은 `id`의 도메인에서 유일한 정수임
  * 다른 `id`의 같은 `version`은 존재할 수 있지만 같은 `id`의 같은 `version`은 존재하지 않음
*  `id`와 `version`를 복합키로 `TermData`의 레코드를 조회 가능

## 정책 및 약관의 기능 및 프로세스

1. 등록

   * 정책 및 약관 페이지에서 등록 버튼으로 생성 폼을 표시
   * 내용을 입력하고 생성 요청
   * 백엔드 서버에서 새로운 `Terms` 레코드와 `TermData` 레코드 생성

2. 갱신 (수정)

   1. 정책 및 약관 페이지에서, 이미 등록된 아이템의 수정 버튼을 클릭
   2. 백엔드에서 해당 `Terms`의 최신 `TermData`를 응답
   3. 프론트엔드에서 수정 폼을 표시
      * 수정 폼에는 기존 버전의 정책 및 약관의 내용이 입력되어 있음
   4. 제목과 내용을 수정한 다음 저장 버튼 클릭, 수정 요청
   5. 백엔드서버에서 수정한 약관에 해당하는 `Terms`의 새로운 버전의 `TermData`를 생성하고 `Terms`의 `latest`를 갱신

3. 이력 조회

   1. 정책 및 약관 페이지에서 약관 아이템의 내역 조회 버튼 클릭 (버튼 현재 미구현임), 내역 리스트 요청

   2. 백엔드서버에서 내역 리스트를 응답함

      ```json
      [
        {
          "version": 0,
          "title": "제목 예시",
          "contents": "내용 예시",
          "createdAt": "(이 버전이 생성된 시각 timestamp)"
        },
        {
          "version": 1,
          "title": "수정된 제목 예시",
          "contents": "수정된 내용 예시",
          "createdAt": "(이 버전이 생성된 시각 timestamp)"
        }
      ]
      ```

   3. 프론트엔드에서 드롭리스트로 버전(+ 생성 시각)을 선택하면, 제목과 내용을 표시하는 폼을 보여줌 (미구현)