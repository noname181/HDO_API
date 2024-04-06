'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class daily_resend_results extends Model {
    static associate(models) {
      // define association here
    }
  }
  daily_resend_results.init(
    {
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: true,
        defaultValue: null,
      },
      transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      result: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'daily_resend_results',
      timestamps: false,
      freezeTableName: true,
    }
  );
  return daily_resend_results;
};
