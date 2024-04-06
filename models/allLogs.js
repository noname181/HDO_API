'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AllLogs extends Model {
    static associate(models) {
      models.AllLogs.belongsTo(models.UsersNew, {
        as: 'users',
        foreignKey: 'userId',
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
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      // indexes: [{unique: true, fields: ['divCode']}]       // unique 설정용 부분
    }
  );
  return AllLogs;
};
