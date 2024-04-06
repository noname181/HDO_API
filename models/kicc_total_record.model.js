const cryptor = require('../util/cryptor');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class kicc_total_record extends Model {
    static associate(models) {
      // Add any associations here if needed
    }
  }

  kicc_total_record.init(
    {
      sales_date: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      record_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_records: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_page: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      current_page: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      transaction_count: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      transaction_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cancel_count: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cancel_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_count: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      pg_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      extra_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_commission: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tax_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      adjust_amount: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total_kwh: {
        type: DataTypes.STRING(255), 
        allowNull: true,
      },
      ignore_kwh: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'kicc_total_record',
      timestamps: false,
      paranoid: false,
    }
  );

  return kicc_total_record;
};
