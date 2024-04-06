'use strict';

const { Model } = require('sequelize');
const { USER_LOG_STATUS } = require('../interfaces/userLogStatus.interface');

module.exports = (sequelize, DataTypes) => {
  class UserLogs extends Model {
    static associate(models) {
      models.UserLogs.belongsTo(models.UsersNew, {
        foreignKey: 'userId',
        constraints: false,
      });
    }
  }

  UserLogs.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'UserLogs ID',
      },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(USER_LOG_STATUS),
        defaultValue: USER_LOG_STATUS.SUCCESS,
        comment: 'UserLogs status',
      },
      ipAddress: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'request ip address',
      },
      failedLoginNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
        comment: 'failed login number',
      },
      note: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'note user action',
      },
      details: {
        type: DataTypes.STRING(2048),
        allowNull: true,
      },
      urlPage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'UI page path',
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
      modelName: 'UserLogs',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return UserLogs;
};
