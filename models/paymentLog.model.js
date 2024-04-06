const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // models.Org.hasMany(models.sb_charging_station, {
      // 	as: 'org',
      // 	foreignKey: 'orgId',
      // 	constraints: false
      // });
      // models.Org.hasMany(models.UsersNew, {
      // 	foreignKey: 'orgId',
      // 	constraints: false
      // });
      // models.Org.hasMany(models.UsersNew, {
      // 	foreignKey: 'orgId',
      // 	constraints: false
      // });
      // models.Org.belongsTo(models.UsersNew, {
      // 	as: 'createdBy',
      // 	foreignKey: 'createdWho',
      // 	constraints: false,
      // });
      // models.Org.belongsTo(models.UsersNew, {
      // 	as: 'updatedBy',
      // 	foreignKey: 'updatedWho',
      // 	constraints: false,
      // });
      models.PaymentLog.belongsTo(models.PayMethod, {
        as: 'payMethod',
        foreignKey: 'payMethodId',
        constraints: false,
      });
      models.sb_charging_log.hasOne(models.PaymentLog, {
        as: 'chargingLog',
        foreignKey: 'cl_id',
        constraints: false,
      });
      models.PaymentLog.belongsTo(models.Org, {
        as: 'org',
        foreignKey: 'orgId',
        constraints: false,
      });
      models.PaymentLog.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.PaymentLog.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        constraints: false,
      });
      models.PaymentLog.belongsTo(models.ChargerModel, {
        as: 'charger',
        foreignKey: 'chg_id',
        constraints: false,
      });
      models.PaymentLog.belongsTo(models.Booking, {
        as: 'booking',
        foreignKey: 'bookingId',
        constraints: false,
      });
    }
  }

  PaymentLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '결제내역 id',
      },
      payStatus: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['ING', 'PAID', 'UNPAID', 'REFUND'],
        defaultValue: 'ING',
        comment: '상태(결제 관련 상태 - ING진행중, UNPAID미결상태, PAID결제상태, REFUND환불 )',
      },
      payType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['CHG', 'WASH', 'SUB_P', 'SUB_C', 'RF_ISSUE', 'NOSHOW'],
        defaultValue: 'CHG',
        comment:
          '결제 종류 충전 : CHG 미출차 수수료 : WASH 개인구독 : SUB_P 법인상품 : SUB_C RF카드발급 : RF_ISSUE No-Show: NOSHOW',
      },
      kicc_pgCno: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제승인 id',
      },
      // kicc_shopTransactionId: {
      // 	type: DataTypes.STRING(36),
      // 	allowNull: false,
      // 	comment: 'ev transaction id(pg에서 전달될 결제내역 고유값 - 영수증번호)',
      // },
      confirmPrice: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '확정 결제금액 ',
      },
      // discountPrice: {
      // type: DataTypes.INTEGER(10).UNSIGNED,
      // 	allowNull: false,
      // 	defaultValue: 0,
      // 	comment: '할인금액'
      // },
      prepaidPrice: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '최초 지불금액',
      },
      cancelPrice: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '부분취소금액',
      },
      chargeFee: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '충전 결제 금액 ',
      },
      parkFee: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '미출차 수수료 결제 금액 ',
      },
      payMethodDetail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제 카드 식별용 정보(ex. 카드 마지막 4자리 등) - 비회원 결제기록용',
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제 관련 메모',
      },
      kicc_return: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '결제 트랜젝션 로그',
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
      modelName: 'PaymentLog',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [{ unique: true, fields: ['cl_id'] }],
    }
  );
  return PaymentLog;
};
