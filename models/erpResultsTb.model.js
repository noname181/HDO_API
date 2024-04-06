'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ErpResultsTb extends Model {
    static associate(models) {
      // define association here
      models.ErpResultsTb.belongsTo(models.Org, {
        as: 'org',
        foreignKey: 'erp_id',
        targetKey: 'erp',
        constraints: false,
      });
    }
  }
  ErpResultsTb.init(
    {
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: true,
        defaultValue: null,
      },
      erp_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      req_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      }, 
      transfer_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      erp_trial: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      erp_send_result: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      erp_send_message: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      check_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      check_trial: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      erp_check_result: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      erp_check_message: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ErpResultsTb',
      tableName: 'erp_results_tb',
      timestamps: false,
      freezeTableName: true,
      indexes: [{ unique: true, fields: ['data_day', 'erp_id', 'req_type'] }],
    }
  );
  return ErpResultsTb;
};
