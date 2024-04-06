const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class sb_charging_pay_fail_log extends Model {
    static associate(models) {
      models.sb_charging_pay_fail_log.belongsTo(models.sb_charging_log, {
        as: 'chargingLog',
        foreignKey: 'cl_id',
        constraints: false,
      });
    }
  }

  sb_charging_pay_fail_log.init(
      {
        cpf_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '충전실패로그 pk',
        },
        cl_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          comment: 'sb_charging_logs pk',
        },
        resCd: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '결과코드',
        },
        resMsg: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '결과 메시지',
        },
        statusCode: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '거래 상태 코드',
        },
      },
      {
        sequelize,
        modelName: 'sb_charging_pay_fail_log',
        tableName: 'sb_charging_pay_fail_logs',
        comment: '충전 진행후 결제, 부분취소에 실패한 로그',
        engine: 'InnoDB',
        createdAt: true,
        updatedAt: true,
        indexes: [
          { name: 'cl_id', fields: ['cl_id'], using: 'BTREE' },
        ],
      }
  );

  return sb_charging_pay_fail_log;
};