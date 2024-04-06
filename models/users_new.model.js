'use strict';

const { Model } = require('sequelize');
const cryptor = require('../util/cryptor');

module.exports = (sequelize, DataTypes) => {
  class UsersNew extends Model {
    static associate(models) {
      models.UsersNew.hasMany(models.Vehicle, {
        as: 'vehicles',
        foreignKey: 'usersNewId',
        constraints: false,
      });
      models.UsersNew.belongsTo(models.Org, {
        foreignKey: 'orgId',
        constraints: false,
      });
      models.UsersNew.belongsTo(models.SAP_Person, {
        foreignKey: 'accountId',
        sourceKey: 'PERNR',
        constraints: false,
      });
      models.UsersNew.hasMany(models.sb_charging_log, {
        as: 'chargingLog',
        foreignKey: 'usersNewId',
        constraints: false,
      });
      models.UsersNew.hasMany(models.PayMethod, {
        as: 'payMethods',
        foreignKey: 'usersNewId',
        constraints: false,
      });
      models.UsersNew.hasMany(models.UserOauth, {
        as: 'userOauths',
        foreignKey: 'usersNewId',
        sourceKey: 'id',
        constraints: false,
      });
      models.UsersNew.belongsTo(models.AppSetting, {
        as: 'AppSettings',
        foreignKey: 'usersNewId',
        constraints: false,
      });
      models.UsersNew.hasMany(models.BankCard, {
        as: 'bankCards',
        foreignKey: 'userId',
        constraints: false,
      });
      models.UsersNew.belongsTo(models.Role, {
        foreignKey: 'roleId',
        constraints: false,
      });
      models.UsersNew.hasMany(models.AllLogs, {
        as: 'allLogs',
        foreignKey: 'userId',
        constraints: false,
      });
    }
  }

  UsersNew.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'UserNew id',
      },
      id_old: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'UserNew id old',
      },
      accountId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '로그인용 계정 id(모바일 사용자) (account id)',
      },
      dupinfo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: '개인중복식별고유값(Personal Unique Code)',
      },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['ACTIVE', 'SLEEP', 'BLOCK', 'RETIRED'],
        defaultValue: 'ACTIVE',
        comment:
          '사용자 상태(활성, 휴면, 정지, 탈퇴) (account status, ACTIVE | SLEEP | BLOCK | RETIRED, default: ACTIVE)',
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['MOBILE', 'HDO', 'ORG'],
        defaultValue: 'MOBILE',
        comment: '사용자 상태(활성, 휴면, 정지, 탈퇴) (account type, MOBILE | HDO | ORG, default: MOBILE)',
      },
      role: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['ADMIN', 'VIEWER'],
        defaultValue: 'VIEWER',
        comment: '권한(ADMIN관리자, VIEWER조회만 가능한 사용자) (account role, ADMIN | HDO | ORG, default: MOBILE)',
      },
      gender: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '유저 성별',
      },
      birth: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '유저 생년월일',
      },
      saltRounds: {
        type: DataTypes.STRING(320),
        allowNull: true,
        comment: 'salt',
      },
      hashPassword: {
        type: DataTypes.STRING(320),
        allowNull: true,
        comment: 'password hashed',
      },
      md5Password: {
        type: DataTypes.STRING(320),
        allowNull: true,
        comment: 'md5 password',
      },
      isRequireResetPassword: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        values: [true, false],
        defaultValue: false,
        comment: 'true if org user have request to reset password',
      },
      isRequireCreateAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        values: [true, false],
        defaultValue: false,
        comment: 'true if org user have request to create account',
      },
      refreshToken: {
        type: DataTypes.STRING(320),
        allowNull: true,
        comment: 'refreshToken to generate new token',
      },
      dept: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '부서',
      },
      nfcMembershipNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment:
          'NFC 멤버쉽 번호 (membership number from NFC card / 안드로이드에서 NFC태깅을 했을때 idTag값으로 들어옴. / 회원가입시에 발급할꺼임 아마도.))',
      },
      physicalCardNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment:
          '실물카드(RF) 번호 (안드로이드와 아이폰에서 실물카드를 이용한 태깅을 했을때 idTag값으로 들어옴. 티머니같은 교통카드 개념.)',
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '본인실명인증여부 (email is verify or not, default: false)',
      },
      pwdChgRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '비밀번호 변경(법인회원용)',
      },
      name: {
        type: DataTypes.STRING(320),
        allowNull: false,
        comment: '(암호화된) 사용자명 (user fullname)',
      },
      phoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '(암호화된)사용자 연락처 (user phone number)',
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: true,
        validate: {
          isEmail: true,
        },
        comment: 'user email',
      },
      subsDCPrice: {
        type: DataTypes.SMALLINT(5).UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '구독할인 (구독, 해지, 변경에 따라 업데이트 필요)',
      },
      deviceId: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '푸시알림용 디바이스 id',
      },
      userAgreements: {
        /* JSON의 경우 MySQL 문법규칙상 defaultValue 조치가 불가능하여 allowNull을 하지 않으려면 create api에서 별도 조치 필요 */
        /* 또한 별도로 수동으로 USER row INSERT시 수동으로 값을 입력해줘야 함 */
        type: DataTypes.JSON,
        allowNull: true,
        comment: '선택 약관 동의 여부(Array) - ex) [fasle, false, false, false, false] - 현재는 항목 5개',
      },
      haveUnpaid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        values: [true, false],
        defaultValue: false,
        comment: '미납 존재 여부',
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      detailAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      zipCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      currentAccessDateTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('NOW'),
        comment: '사용자 최근 접속 날짜 및 시간',
      },
      profileImage: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: '프로필 이미지 (user profile image)',
      },
      verifyEmailSendedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('NULL'),
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '프로필 이미지 (user profile image)',
      },
      lastUsedMacAddr: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: '해당 회원이 마지막으로 충전을 진행했던 차량 MAC 주소 (MAC address)',
      },
      number_of_reports: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastOnline: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UsersNew',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return UsersNew;
};
