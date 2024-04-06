const cryptor = require('../util/cryptor');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class charger_records_tb extends Model {
    static associate(models) {
      models.charger_records_tb.belongsTo(models.sb_charging_station, {
        as: 'chargingStation',
        foreignKey: 'station_id',
        targetKey: 'chgs_id',
        constraints: false,
      });
    }
  }

  charger_records_tb.init(
    {
      data_day: {
        type: DataTypes.CHAR(12),
        allowNull: false,
      },
      charger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      station_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      erp_id: {
        type: DataTypes.CHAR(8),
        allowNull: false,
        defaultValue: '0',
      },
      daycharge_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      dayignore_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: '0',
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mall_id: {
        type: DataTypes.CHAR(12),
        allowNull: false,
      },
      sales_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: '0',
      },
      payment_method: {
        type: DataTypes.CHAR(2),
        allowNull: false,
      },
      area_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      station_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '0',
      },
      transaction_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      cancel_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      cancel_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      commission_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
      deposit_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0',
      },
    },
    {
      sequelize,
      modelName: 'charger_records_tb',
      tableName: 'charger_records_tb',
      timestamps: false,
      paranoid: false,
    }
  );

  return charger_records_tb;
};
