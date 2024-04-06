# 개발 참조용 Readme

- ### API 개발 참고

1. 각 api 코드 상단 설정에서

   checkToken: true,      // default true

   roles: ['admin', 'viewer],

    을 통해 토큰을 요구하게 되고, 요구 roles가 'all'이 아니라면, role-checker를 지나오면서
    api 코드 안에서 해당 유저의 권한이나 소속 정보를 간편하게 확인 가능함.

   *권한 - _request.user.roles (ADMIN, VIEWER etc)

   전체 권한은 ['admin', 'viewer', 'stt', 'cs', 'as', 'rf_card', 'biz', 'allnc', 'grp'] 이며 종류별로 각각
   
   admin - hdo관리자 중 마스터권한
   viewer - hdo관리자 중 조회권한
   stt - 자영/직영 관리자
   cs - cs팀
   as - as팀
   biz - 법인회원(모바일, 웹회원)
   allnc - 제휴회원
   grp - 그룹(동호회 등) 회원

* 소속분류 - _request.user.org
(소속구분(일반이용자(DEF), 현대오일뱅크(HDO), 직영 충전소(STT_DIR), 자영 충전소(STT_FRN), CS, AS, 법인(BIZ), 협력사(ALLNC), 그룹(GRP), 파킹스루(RF_CARD)))

2. 전화번호는 저장시 '-'를 제외하고 전달받아 암호화 해서 저장

3. deletedAt은 조회시 무조건 exclude(joined/include된 데이터에서도 전부 exclude)

---
#### url 쿼리 파라미터용 규칙

1. 단순 string의 경우 

   1) 'all' 구분 X
      ```js
      const area = _request.query.area ? _request.query.area.toLowerCase() : undefined;

   2) 'all' 구분 O (all과 같이 특정 조건으로 조회시 전체가 조회되는 경우 - 보통 필요 없음)
      ```js
      const area = (_request.query.area && !['all'].includes(_request.query.area.toLowerCase())) ? _request.query.area.toLowerCase() : undefined;

    3) 'true/false'로 조회하며, 그 외에는 string으로 반환하는 경우
      ```js
        const haveCarWash = convertQueryParam(_request.query.wash);
   
         // true/false 분기처리가 필요한 쿼리용 함수
         // 사용시 (haveCarWash) 대신 (haveCarWash !== undefined)를 이용한 분기처리가 필요
         function convertQueryParam(value) {
            const lowercasedValue = value?.toLowerCase();
      
             return lowercasedValue === 'true'
                 ? true
                 : lowercasedValue === 'false'
                     ? false
                     : typeof value === 'string' && value !== ''
                         ? value
                         : undefined;
         }
   

---
#### creatdWho, updatedWho 관련 join 규칙

1. 모델에서 정의 : 해당 테이블이 User가 추가/수정 하는지 WebUser가 추가/수정하는지에 따라 모델 정의

   ```javascript
      // WebUser 테이블에 참조되는 경우
      models.Org.belongsTo(models.WebUser, {
          as: 'createdBy',
          foreignKey: 'createdWho',
          constraints: false,
      });
      models.Org.belongsTo(models.WebUser, {
          as: 'updatedBy',
          foreignKey: 'updatedWho',
          constraints: false,
      });
   
      // User 테이블에 참조되는 경우
      models.Org.belongsTo(models.User, {
          as: 'createdBy',
          foreignKey: 'createdWho',
          constraints: false,
      });
      models.Org.belongsTo(models.User, {
          as: 'updatedBy',
          foreignKey: 'updatedWho',
          constraints: false,
      });
   ```


2. 조회시 조치

   - 조회 option
   - option.include에 추가
      ```javascript
        [ // WebUser 테이블의 경우
         {model: models.WebUser, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'retired', 'orgId']},
         {model: models.WebUser, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'retired', 'orgId']},
        ]
     
        [ // User 테이블의 경우
         {model: models.User, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId']},
         {model: models.User, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId']},
        ]
     ```
   - option.attributes.exclude에서 'createdWho', 'updatedWho' 추가하여 결과물에서 삭제
      ```javascript
        attributes: {exclude: ['createdWho', 'updatedWho', 'deletedAt']},
     ```
   - 적용예시
      ```javascript
        let options = {
              where: where,
              include: [
                  {model: models.sb_charger, as: 'chargers', attributes: {exclude: ['createdWho', 'updatedWho', 'deletedAt']}},
                  {model: models.Org, where: whereOrg, as: 'org', attributes: {exclude: ['createdWho', 'updatedWho', 'deletedAt']}},
                  {model: models.WebUser, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'retired', 'orgId']},
                  {model: models.WebUser, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'retired', 'orgId']},
              ],
              attributes: {exclude: ['createdWho', 'updatedWho', 'deletedAt']},
              order: [['createdAt', orderByQueryParam]],
              offset: (pageNum * rowPerPage),
              limit: rowPerPage,
              distinct: true
         }
     ```

