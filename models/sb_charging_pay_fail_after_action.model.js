const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class sb_charging_pay_fail_after_action extends Model {
    static associate(models) {
      models.sb_charging_pay_fail_after_action.belongsTo(models.sb_charging_log, {
        as: 'chargingLog',
        foreignKey: 'cl_id',
        constraints: false,
      });
      models.sb_charging_pay_fail_after_action.belongsTo(models.UsersNew, {
        as: 'costUser',
        foreignKey: 'costUserId', 
        constraints: false,
      });
      models.sb_charging_pay_fail_after_action.belongsTo(models.UsersNew, {
        as: 'paidUser',
        foreignKey: 'paidUserId', 
        constraints: false,
      });
    }
  }

  sb_charging_pay_fail_after_action.init(
      {
        aa_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'index',
        },
        cl_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          comment: '충전로그 id',
        },
        afterAction: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
          comment: 'COST / PAID',
        },
        costReason: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
          comment: 'Reason for COST processing.(잡손실처리에 대한 이유)',
        },
        costUserId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
          defaultValue: null,
          comment: 'COST(잡손실) 처리를 한 사람의 id',
        },
        paidUserId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
          defaultValue: null,
          comment: 'PAID(재결제완료) 처리를 한 사람의 id',
        },
        amount: {
          type: DataTypes.INTEGER(10).UNSIGNED,
          allowNull: true,
          defaultValue: null,
          comment: '잡손실처리, 재결제처리된 금액',
        },
      },
      {
        sequelize,
        modelName: 'sb_charging_pay_fail_after_action',
        tableName: 'sb_charging_pay_fail_after_actions',
        comment: '후불 결제 실패건에 대한 후속 조치',
        engine: 'InnoDB',
        createdAt: true,
        updatedAt: true,
        paranoid: true,
        indexes: [
          { name: 'cl_id', fields: ['cl_id'], using: 'BTREE' },
        ],
      }
  );

  return sb_charging_pay_fail_after_action;
};
