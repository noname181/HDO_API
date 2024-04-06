const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class CsLog extends Model {
    static associate(models) {
      // define association here
      models.CsLog.belongsTo(models.UsersNew, {
        as: 'Consultant',
        foreignKey: 'consultantId',
        constraints: false,
      });
      models.CsLog.belongsTo(models.UsersNew, {
        as: 'Customer',
        foreignKey: 'customerId',
        constraints: false,
      });
      models.CsLog.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.CsLog.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.CsLog.belongsTo(models.Org, {
        as: 'Org',
        foreignKey: 'orgId',
        constraints: false,
      });
    }
  }
  CsLog.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'cs log ID',
      },
      csId: {
        type: DataTypes.BIGINT.UNSIGNED,
        comment: 'cs ID',
      },
      regNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '접수 번호',
      },
      messageId: {
        type: DataTypes.BIGINT.UNSIGNED,
        comment: '문자 ID',
      },
      ktApiId1: {
        type: DataTypes.STRING(255),
        comment: 'KT API ID 값 (KT 커스텀 프로 솔루션 KEY 값) -1',
      },
      ktApiId2: {
        type: DataTypes.STRING(255),
        comment: 'KT API ID 값 (KT 커스텀 프로 솔루션 KEY 값) -2',
      },
      incomingCd: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['CTP', 'APP', 'MAN'],
        defaultValue: 'CTP',
        comment: '인입 분류 => 상담센터: CTP, APP신고: APP, 수동등록: MAN',
      },
      callStartTime: {
        type: DataTypes.DATE,
        comment: '통화 인입 시간',
      },
      callEndTime: {
        type: DataTypes.DATE,
        comment: '통화 종료 시간',
      },
      csCls1: {
        type: DataTypes.STRING(255),
        comment: '상담 분류1(KT 제공 데이터)',
      },
      csCls2: {
        type: DataTypes.STRING(255),
        comment: '상담 분류2(KT 제공 데이터)',
      },
      csContent: {
        type: DataTypes.TEXT,
        comment: '상담 내용',
      },
      prsContent: {
        type: DataTypes.TEXT,
        comment: '처리 내용',
      },
      statusCd: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment:
          '처리상태 => 보류: HOL, 완료: COM, 승인: APR, 환불: REF, 승인요청: ARR, 환불요청: RER, 반려: RET, 이관: TRA, 회수: RCT',
      },
      completeDate: {
        type: DataTypes.DATE,
        comment: '완료 일시',
      },
      approveWho: {
        type: DataTypes.STRING(255),
        comment: '승인자',
      },
      approveAt: {
        type: DataTypes.DATE,
        comment: '승인 일시',
      },
      csClass: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['CHG', 'BRK', 'PAY', 'REG', 'APP', 'CAR', 'ERR', 'PNC', 'ETC'],
        defaultValue: 'ETC',
        comment:
          '상담분류 => 충전문제: CHG, 충전기 고장: BRK, 충전기 결제: PAY, 회원가입: REG, APP 결제: APP, 차량등록: CAR, 충전기 정보 오류: ERR, PNC등록문제: PNC, 기타: ETC',
      },
      phoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '(암호화된)인입 연락처',
      },
      transId: {
        type: DataTypes.BIGINT.UNSIGNED,
        comment: '이관 ID',
      },
      recordFile: {
        type: DataTypes.STRING(255),
        comment: '녹취 파일',
      },
      hisCreatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        comment: '이력생성 일시',
      },
      chgs_id: {
        type: DataTypes.STRING(255),
        comment: '충전소 id',
      },
    },
    {
      sequelize,
      modelName: 'CsLog',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      paranoid: false,
    }
  );
  return CsLog;
};
