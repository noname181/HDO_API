const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Logging extends Model {}

  Logging.init(
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        comment: 'logging id',
      },
      timestamp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'logging timestamp',
      },
      level: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'logging level',
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'logging message',
      },
      info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'logging info',
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
      modelName: 'Logging',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );

  return Logging;
};
