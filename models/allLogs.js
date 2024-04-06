'use strict';

const { Model } = require('sequelize');
const { LOG_TYPE } = require('../controllers/webAdminControllers/logControllers/logType.enum');
const { LOG_LEVEL } = require('../controllers/webAdminControllers/logControllers/logType.enum');

module.exports = (sequelize, DataTypes) => {
  class AllLogs extends Model {
    static associate(models) {
      models.AllLogs.belongsTo(models.UsersNew, {
        as: 'user',
        foreignKey: 'userId',
        targetKey: 'id',
        constraints: false,
      });
    }
  }

  AllLogs.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: 'id',
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'url of api register card',
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(LOG_TYPE),
        defaultValue: LOG_TYPE.PAYMENT,
        comment: 'type of log',
      },
      level: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(LOG_LEVEL),
        defaultValue: LOG_LEVEL.INFO,
        comment: 'level of log',
      },
      content: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'payment gateway response data',
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
    },
    {
      sequelize,
      modelName: 'all_logs',
      freezeTableName: true,
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: false, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
    }
  );
  return AllLogs;
};
