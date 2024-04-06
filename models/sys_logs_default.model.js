const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sys_logs_default extends Model {}

  sys_logs_default.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'id',
      },
      level: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'level',
      },
      message: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        comment: 'message',
      },
      meta: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        comment: 'meta',
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'logging timestamp',
      },
    },
    {
      sequelize,
      modelName: 'sys_logs_default',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );

  return sys_logs_default;
};
