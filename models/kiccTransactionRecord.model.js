'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KiccTransactionRecord extends Model {
    static associate(models) {
      // define association here
      models.KiccTransactionRecord.belongsTo(models.sb_charger, {
        as: 'charger',
        foreignKey: 'payment_place',
        targetKey: 'mall_id',
        constraints: false,
      });
    }
  }
  KiccTransactionRecord.init(
    {
      record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      record_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'N',
      },
      payment_date: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payment_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payment_place: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      deal_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      deal_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
      },
      approval_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pay_amount: {
        type: DataTypes.INTEGER(12),
        allowNull: false,
        defaultValue: 0,
      },
      org_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      monthly_payment: {
        type: DataTypes.STRING(255),
      },
      credit_card: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      payment_time: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      order_person: {
        type: DataTypes.STRING(255),
      },
      balgup_gubun: {
        type: DataTypes.STRING(255),
      },
      cert_gubun: {
        type: DataTypes.STRING(255),
      },
      certification_id: {
        type: DataTypes.STRING(255),
      },
      tax_amount: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      commission_amount: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      business_id: {
        type: DataTypes.STRING(255),
      },
      goods_name: {
        type: DataTypes.STRING(255),
        defaultValue: '0000000000',
      },
      cancel_id: {
        type: DataTypes.STRING(255),
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'KiccTransactionRecord',
      tableName: 'kicc_transaction_records',
      timestamps: false,
      indexes: [{ unique: true, fields: ['transaction_id', 'deal_type', 'payment_time'] }],
    }
  );
  return KiccTransactionRecord;
};
