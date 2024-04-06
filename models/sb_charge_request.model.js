'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sb_charge_request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*사용자 충전기 이용 로그 테이블*/
    static associate(models) {
      // define association here
      models.sb_charge_request.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.sb_charge_request.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.sb_charge_request.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        constraints: false,
      });
      models.sb_charge_request.belongsTo(models.sb_charger, {
        as: 'chargers',
        foreignKey: 'chg_id',
        sourceKey: 'chg_id',
        constraints: false,
      });
      models.sb_charge_request.belongsTo(models.sb_charging_log, {
        as: 'chargingLogs',
        foreignKey: 'cl_id',
        sourceKey: 'cl_id',
        constraints: false,
      });
    }
  }
  sb_charge_request.init(
    {
      cr_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '충전 요청 pk, 인덱스 번호',
      },
      request_type: {
        type: DataTypes.ENUM,
        values: ['CANCEL', 'REFUND', 'PAYMENT'],
        allowNull: true,
        comment: 'CANCEL: 부분취소,  REFUND : 환불,  PAYMENT : 후불결제',
      },
      chg_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '충전기 아이디',
      },
      cl_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '충전로그 아이디',
      },
      conn_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
        comment: '커넥터 아이디',
      },
      chargingLogId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '해당 결제건과 연결된 차징로그건의 id',
      },
      pgCno: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '결제승인 id',
      },
      card_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        comment: '충전요청 카드id',
      },
      request_kwh: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '충전 요청량',
      },
      request_percent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '충전 요청 퍼센트',
      },
      request_amt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '예상금액',
      },
      actual_calculated_amt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '계산된 결제 금액',
      },
      refund_amt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '환불 금액',
      },
      dummy_pay_amt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '예상치못한 금액오류로 결제된 보정된금액',
      },
      paymentResponse: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '실제 결제 응답 콜백 로그',
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
      modelName: 'sb_charge_request',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return sb_charge_request;
};
