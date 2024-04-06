const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
/* 상담 내역 */
module.exports = (sequelize, DataTypes) => {
  class data_results_tb extends Model {
    static associate(models) { 
    }
  }
  data_results_tb.init(
    {
      //ex: 20231130
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: false,
        defaultValue: 0,
      },
      data_gubun: {
        type: DataTypes.CHAR(12),
        allowNull: false,
        defaultValue: 0,
      },
      data_time: {
        type: 'TIMESTAMP',
        allowNull: true,
        defaultValue: null,
      },
      data_trial: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },
      data_results: {
        type: DataTypes.CHAR(2),
        allowNull: true,
        defaultValue: null,
      },
      record_count: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0,
      }, 
    },
    {
      sequelize,
      modelName: 'data_results_tb',
      tableName: 'data_results_tb',
      timestamps: false,
      paranoid: false,
    }
  );
  return data_results_tb;
};
