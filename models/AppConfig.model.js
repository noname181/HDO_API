const { Model, DataTypes, sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AppConfig extends Model {}

  AppConfig.init(
    {
      app_version: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      force_update_flag: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '1: true, 0: false',
      },
      dynamic_link: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      popup_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      popup_body: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AppConfig',
      tableName: 'AppConfig',
      collate: 'utf8_general_ci',
      engine: 'InnoDB',
      timestamps: false,
    }
  );

  return AppConfig;
};