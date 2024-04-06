const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class bank_total_record extends Model {
    static associate(models) {}
  }
  bank_total_record.init(
    { 
      data_day: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        defaultValue: '0',
        collate: 'utf8mb4_general_ci',
      },
      deposit_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      deposit_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      zif_key: {
        type: DataTypes.CHAR(20),
        allowNull: false,
        defaultValue: '0',
        collate: 'utf8mb4_general_ci',
      },
    },
    {
      sequelize,
      modelName: 'bank_total_record',
      timestamps: false,
      paranoid: false,
    }
  );
  return bank_total_record;
};
