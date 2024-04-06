const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  /* 환경부  API에서 가져온 데이터 원본*/
  class BannerModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.BannerModel.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.BannerModel.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
    }
  }
  BannerModel.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'banner title',
      },
      number: {
        type: DataTypes.INTEGER(5),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'banner image',
      },
      secondaryImage: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      view: {
        type: DataTypes.INTEGER(5),
        allowNull: true,
        defaultValue: 0,
        comment: 'total viewed',
      },
      bannerPosition: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'banner position',
      },
      banner_sliding_yn: {
        type: DataTypes.BOOLEAN,
        comment: 'enable slide for banner (true/false)',
      },
      startdate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'start date show banner',
      },
      enddate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'end date show banner',
      },
      option: {
        type: DataTypes.STRING,
        allowNull: true,
        values: ['자사', '제휴'],
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Image url',
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
      modelName: 'BannerModel',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return BannerModel;
};
