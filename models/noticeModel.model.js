const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  /* 환경부  API에서 가져온 데이터 원본*/
  class NoticeModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.NoticeModel.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.NoticeModel.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  NoticeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Notice ID',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Title of the notice',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Content of the notice',
      },
      regtime: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Registration time of the notice',
      },
      count: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of views/counts for the notice',
      },
      detail: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Additional details of the notice',
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Url image of the notice',
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
      modelName: 'NoticeModel',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return NoticeModel;
};
