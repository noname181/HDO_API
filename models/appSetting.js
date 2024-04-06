const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AppSetting extends Model {
    static associate(models) {
      models.AppSetting.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.AppSetting.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.AppSetting.belongsTo(models.UsersNew, {
        as: 'User',
        foreignKey: 'usersNewId',
        constraints: false,
      });
    }
  }

  AppSetting.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: '차량 id',
      },
      auto_login_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
      },
      notifications_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
      },
      ads_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
      },
      app_version: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      map_app: {
        type: DataTypes.INTEGER,
        allowNull: false,
        values: [0, 1, 2],
        defaultValue: 0,
        comment: '0 is a disable',
      },
      app_display: {
        type: DataTypes.INTEGER,
        allowNull: false,
        values: [0, 1],
        defaultValue: 0,
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      is_marketing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'AppSetting',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
    }
  );
  return AppSetting;
};
