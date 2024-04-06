const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  /* 환경부  API에서 가져온 데이터 원본*/
  class WebNotice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.WebNotice.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.WebNotice.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.WebNotice.belongsTo(models.UsersNew, {
        foreignKey: 'userId',
        constraints: false,
      });
    }
  }
  WebNotice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Notice ID',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Title of the notice',
      },
      contents: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Content of the notice',
      },
      firstDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'start date',
      },
      lastDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'end date',
      },
      imagesUrl: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Url images of the notice',
      },
      isActive: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Y', 'N'],
        defaultValue: 'N',
      },
      type: {
        type: DataTypes.CHAR(9),
        values: ['MOBILE', 'WEB'],
        defaultValue: 'WEB',
        allowNull: false,
        comment: 'Notice popup for web or mobile notifications',
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
      modelName: 'WebNotice',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return WebNotice;
};
