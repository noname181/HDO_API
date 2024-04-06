const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sb_charge_local_ic_pay_phone_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /* 충전기 현장결제 모바일번호 정보 등록*/

    static associate(models) {
      // define association here

    }
  }

  Sb_charge_local_ic_pay_phone_log.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'sb_charge_local_ic_pay_phone_log id',
      },
      chg_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '충전기인덱스',
      },
      connector_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '커넥터 ID(충전기채널)',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '휴대폰번호',
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'sb_charge_local_ic_pay_phone_log',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: false, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return Sb_charge_local_ic_pay_phone_log;
};
