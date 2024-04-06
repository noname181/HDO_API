const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    static associate(models) {
      models.Media.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.Media.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }

  Media.init(
    {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        comment: 'media id',
      },
      filePath: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'file path',
      },
      s3Url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 's3 url',
      },
      createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Media',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
      indexes: [
        { name: 'createdWho', fields: ['createdWho'] },
        { name: 'updatedWho', fields: ['updatedWho'] },
        { name: 'filePath', fields: ['filePath'] },
      ],
    }
  );

  return Media;
};
