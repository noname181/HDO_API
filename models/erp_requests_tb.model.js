const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class erp_requests_tb extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  erp_requests_tb.init(
    { 
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: false,
        collate: 'utf8mb4_general_ci',
      },
      erp_id: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        collate: 'utf8mb4_general_ci',
      },
      payment_type: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        collate: 'utf8mb4_general_ci',
      },
      req_type: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        defaultValue: '',
        collate: 'utf8mb4_general_ci',
      },
      erp_trial: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      erp_send_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      erp_send_result: {
        type: DataTypes.CHAR(2),
        allowNull: true,
        defaultValue: null,
        collate: 'utf8mb4_general_ci',
      },
      erp_send_message: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        collate: 'utf8mb4_general_ci',
      },
      sent_deletion: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        defaultValue: 'N',
        collate: 'utf8mb4_general_ci',
      },
      check_time: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      check_trial: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      erp_check_result: {
        type: DataTypes.CHAR(2),
        allowNull: true,
        defaultValue: null,
        collate: 'utf8mb4_general_ci',
      },
      erp_check_message: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        collate: 'utf8mb4_general_ci',
      },
    },
    {
      sequelize,
      modelName: 'erp_requests_tb',
      tableName: 'erp_requests_tb',
      timestamps: false,
      paranoid: false,
    }
  );

  return erp_requests_tb;
};
