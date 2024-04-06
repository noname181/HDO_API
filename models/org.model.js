const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Org extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Org.hasMany(models.sb_charging_station, {
        as: 'org',
        foreignKey: 'orgId',
        constraints: false,
      });
      models.Org.hasMany(models.UsersNew, {
        foreignKey: 'orgId',
        constraints: false,
      });
      models.Org.hasMany(models.UsersNew, {
        foreignKey: 'orgId',
        constraints: false,
      });
      models.Org.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Org.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.Org.hasOne(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'orgId',
        constraints: false,
      });
      models.Org.hasMany(models.UsersNew, {
        foreignKey: 'orgId',
        constraints: false,
      });
      models.Org.belongsTo(models.sap_evstation_tb, {
        as: 'sap_evstation_tb',
        foreignKey: 'erp',
        targetKey: 'KUNNR',
        constraints: false,
      });
    }
  }

  Org.init(
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: 'organization code',
      },
      category: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          'DEF',
          'HDO',
          'STT_DIR',
          'STT_FRN',
          'CS',
          'AS',
          'BIZ',
          'ALLNC',
          'GRP',
          'RF_CARD',
          'EV_DIV',
          'NON',
          'X1',
          'A1',
          'ETC',
        ],
        defaultValue: 'DEF',
        comment:
          '소속구분(일반이용자(DEF), 현대오일뱅크(HDO), 직영 충전소(STT_DIR), 자영 충전소(STT_FRN), CS, AS, 법인(BIZ), 협력사(ALLNC), 그룹(GRP), 파킹스루(RF_CARD), 비회원(NON), 기타(ETC)',
      },
      fullname: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '전체 이름',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '소속명',
      },
      bizRegNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '사업자번호',
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '주소',
      },
      contactName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '당당자 이름',
      },
      contactPhoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '담당자 연락처',
      },
      contactEmail: {
        type: DataTypes.STRING(320),
        allowNull: true,
        validate: {
          isEmail: true,
        },
        comment: '담당자 이메일',
      },
      deductType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['NONE', 'DC_PRC', 'FIXED'],
        defaultValue: 'NONE',
        comment: '할인 혜택  (없음 : NONE  /  정액할인 : DC_PRC  / 고정단가 : FIXED)',
      },
      discountPrice: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: '정액 할인 금액 1kWh당(원단위. default 0)',
      },
      staticUnitPrice: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: '정액 할인 금액 1kWh당(원단위. default 0)',
      },
      payMethodId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '대표-결제수단id',
      },
      isPayLater: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '후불여부(BIZ용, default false)',
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '후불 블럭되었는지 여부 (*결제가 안되는 경우 블럭)',
      },
      billingDate: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '결제일(객체)',
      },
      closed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '조직 상태 - ACTIVE-false/RETIRE-true',
      },
      area: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '부문/지사 구분 중 부문',
      },
      branch: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '부문/지사 구분 중 지사',
      },
      haveCarWash: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '세차장유무 defalut N',
      },
      region: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      haveCVS: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        comment: '편의점유무 defalut N',
      },
      // 아래부터는 HDO ERP 칼럼
      STN_STN_SEQ: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'HDO_SEQ',
      },
      STN_STN_ID: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '사업장 ID / 대리점 ID ?',
      },
      STN_STN_GUBUN: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '사업장구분 / 작영(STT_DIR)/자영(STT_FRN) ?',
      },
      STN_CUST_NO: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '사업장고객번호 - SAP코드',
      },
      STN_ASSGN_AREA_GUBUN: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '소속지역구분',
      },
      STN_COST_CT: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '코스트센터',
      },
      STN_PAL_CT: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '손익센터',
      },
      STN_STN_SHORT_NM: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '사업장약명  (*에이치디현대오일뱅크㈜ 직영 양화교셀프주 => 양화교셀프)',
      },
      erp: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'erp',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Org',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return Org;
};
