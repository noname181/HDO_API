const cryptor = require('../util/cryptor');
('use strict');
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  /* 환경부  API에서 가져온 데이터 원본*/
  class ChargerModelFW extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /*환경부 API에서 가져온 데이터 원본*/
    static associate(models) {
      // define association here
      models.ChargerModelFW.belongsTo(models.UsersNew, {
        as: 'createdBy',
        foreignKey: 'createdWho',
        constraints: false,
      });
      models.ChargerModelFW.belongsTo(models.UsersNew, {
        as: 'updatedBy',
        foreignKey: 'updatedWho',
        constraints: false,
      });
      models.ChargerModelFW.belongsTo(models.ChargerModel, {
        as: 'chargerModel',
        foreignKey: 'modelId',
        constraints: false,
      });
    }
  }
  ChargerModelFW.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'firmware ID',
      },
      modelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'modelId',
      },
      fwVer: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'firmware version',
      },
      fwFileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'firmware 파일 명',
      },
      fwFileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'firmware 저장 위치',
      },
      isLast: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        values: [true, false],
        defaultValue: false,
        comment: '최신 펌웨워 여부(true - 최신)',
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
      modelName: 'ChargerModelFW',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true, // true이면 soft-delete(삭제해도 지워지지 않고 deletedAt으로 삭제한 시간을 설정)
    }
  );
  return ChargerModelFW;
};
